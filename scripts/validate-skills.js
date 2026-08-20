#!/usr/bin/env node
'use strict';

// Validates the structural invariants CLAUDE.md documents:
//   - every skill in a promoted bucket (engineering/, productivity/) is listed,
//     under the correct User-invoked/Model-invoked group, in the top-level
//     README.md, its bucket README.md, and .claude-plugin/plugin.json, and has
//     a docs page at docs/<bucket>/<name>.md following the required template shape
//   - every skill in a non-promoted bucket (misc/, personal/, in-progress/,
//     deprecated/) is absent from all three, but still listed in its bucket README
//   - every relative link in a README.md resolves to a real file

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_ROOT = path.join(ROOT, 'skills');
const PROMOTED = ['engineering', 'productivity'];

const errors = [];
const fail = (msg) => errors.push(msg);
const rel = (p) => path.relative(ROOT, p);
const read = (p) => fs.readFileSync(p, 'utf8');

function parseFrontmatter(content, file) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    fail(`${rel(file)}: missing frontmatter`);
    return {};
  }
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    fm[m[1]] = value;
  }
  return fm;
}

// Which group (User-invoked / Model-invoked) a link sits under: the nearest
// preceding line that is either a heading or a bold standalone marker naming
// the group — covers both the top-level README's "**User-invoked**" markers
// and the bucket READMEs' "## User-invoked" headings.
function groupForLink(content, linkNeedle) {
  const idx = content.indexOf(linkNeedle);
  if (idx === -1) return undefined;
  const before = content.slice(0, idx).split('\n');
  for (let i = before.length - 1; i >= 0; i--) {
    const line = before[i].trim();
    const m = line.match(/^(?:#{1,6}\s*|\*\*)(User-invoked|Model-invoked)(?:\*\*)?\s*$/);
    if (m) return m[1];
  }
  return undefined;
}

function checkLinksResolve(file, content) {
  const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(content))) {
    const href = m[1];
    if (/^https?:\/\//.test(href) || href.startsWith('#')) continue;
    const target = path.resolve(path.dirname(file), href);
    if (!fs.existsSync(target)) {
      fail(`${rel(file)}: link to "${href}" does not resolve`);
    }
  }
}

// --- Discover skills ---

const buckets = fs.readdirSync(SKILLS_ROOT)
  .filter((b) => fs.statSync(path.join(SKILLS_ROOT, b)).isDirectory());

const skills = [];
for (const bucket of buckets) {
  const bucketDir = path.join(SKILLS_ROOT, bucket);
  const names = fs.readdirSync(bucketDir)
    .filter((n) => fs.statSync(path.join(bucketDir, n)).isDirectory());
  for (const name of names) {
    const skillMdPath = path.join(bucketDir, name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    const fm = parseFrontmatter(read(skillMdPath), skillMdPath);
    if (fm.name && fm.name !== name) {
      fail(`${rel(skillMdPath)}: frontmatter name "${fm.name}" doesn't match its directory name "${name}"`);
    }
    skills.push({ bucket, name, userInvoked: fm['disable-model-invocation'] === 'true' });
  }
}

// --- Load the three registries ---

const topReadmePath = path.join(ROOT, 'README.md');
const topReadme = read(topReadmePath);
const pluginJsonPath = path.join(ROOT, '.claude-plugin', 'plugin.json');
const pluginJson = JSON.parse(read(pluginJsonPath));

// --- Reverse check: every plugin.json entry names a real, promoted skill ---

for (const entry of pluginJson.skills) {
  const m = entry.match(/^\.\/skills\/([^/]+)\/([^/]+)$/);
  if (!m) {
    fail(`.claude-plugin/plugin.json: entry "${entry}" isn't shaped like "./skills/<bucket>/<name>"`);
    continue;
  }
  const [, bucket, name] = m;
  if (!PROMOTED.includes(bucket)) {
    fail(`.claude-plugin/plugin.json: entry "${entry}" is in non-promoted bucket "${bucket}"`);
  }
  if (!fs.existsSync(path.join(SKILLS_ROOT, bucket, name, 'SKILL.md'))) {
    fail(`.claude-plugin/plugin.json: entry "${entry}" has no matching skills/${bucket}/${name}/SKILL.md`);
  }
}

// --- Every README.md's relative links resolve ---

const readmeFiles = [topReadmePath, ...buckets.map((b) => path.join(SKILLS_ROOT, b, 'README.md'))];
for (const file of readmeFiles) {
  if (!fs.existsSync(file)) {
    fail(`${rel(file)}: missing bucket README`);
    continue;
  }
  checkLinksResolve(file, read(file));
}

// --- Per-skill checks ---

for (const { bucket, name, userInvoked } of skills) {
  const bucketReadmePath = path.join(SKILLS_ROOT, bucket, 'README.md');
  const bucketReadme = fs.existsSync(bucketReadmePath) ? read(bucketReadmePath) : '';
  // The canonical entry is always a bold list-bullet link — "- **[name](href)**"
  // — which distinguishes it from an incidental inline mention elsewhere (e.g.
  // prose like "use [`/name`](href) to ..." earlier in the same README).
  const bucketLinkNeedle = `**[${name}](./${name}/SKILL.md)**`;
  const inBucketReadme = bucketReadme.includes(bucketLinkNeedle);
  const topLinkNeedle = `**[${name}](./skills/${bucket}/${name}/SKILL.md)**`;
  const pluginEntry = `./skills/${bucket}/${name}`;
  const docsPath = path.join(ROOT, 'docs', bucket, `${name}.md`);

  if (!inBucketReadme) {
    fail(`skills/${bucket}/README.md: no entry linking to ./${name}/SKILL.md`);
  }

  if (PROMOTED.includes(bucket)) {
    const expected = userInvoked ? 'User-invoked' : 'Model-invoked';

    if (!topReadme.includes(topLinkNeedle)) {
      fail(`README.md: no entry linking to skills/${bucket}/${name}/SKILL.md`);
    } else {
      const group = groupForLink(topReadme, topLinkNeedle);
      if (group !== expected) {
        fail(`README.md: "${name}" is listed under "${group ?? 'no group'}" but its frontmatter says ${expected}`);
      }
    }

    if (inBucketReadme) {
      const group = groupForLink(bucketReadme, bucketLinkNeedle);
      if (group !== expected) {
        fail(`skills/${bucket}/README.md: "${name}" is listed under "${group ?? 'no group'}" but its frontmatter says ${expected}`);
      }
    }

    if (!pluginJson.skills.includes(pluginEntry)) {
      fail(`.claude-plugin/plugin.json: missing entry "${pluginEntry}"`);
    }

    if (!fs.existsSync(docsPath)) {
      fail(`docs/${bucket}/${name}.md: missing docs page for promoted skill`);
    } else {
      const docsContent = read(docsPath);
      checkLinksResolve(docsPath, docsContent);
      if (!docsContent.includes(`--skill=${name}`)) {
        fail(`docs/${bucket}/${name}.md: Quickstart block missing "--skill=${name}"`);
      }
      const sourceLink = `[Source](https://github.com/mattpocock/skills/tree/main/skills/${bucket}/${name})`;
      if (!docsContent.includes(sourceLink)) {
        fail(`docs/${bucket}/${name}.md: missing or incorrect [Source] link`);
      }
      for (const heading of ['## What it does', '## When to reach for it', '## Where it fits']) {
        if (!docsContent.includes(heading)) {
          fail(`docs/${bucket}/${name}.md: missing required section "${heading}"`);
        }
      }
      if (!docsContent.includes('https://aihero.dev/skills-ask-matt')) {
        fail(`docs/${bucket}/${name}.md: missing a link to https://aihero.dev/skills-ask-matt`);
      }
    }
  } else {
    if (topReadme.includes(topLinkNeedle)) {
      fail(`README.md: "${name}" is in non-promoted bucket "${bucket}" but appears in the top-level README`);
    }
    if (pluginJson.skills.includes(pluginEntry)) {
      fail(`.claude-plugin/plugin.json: "${name}" is in non-promoted bucket "${bucket}" but is listed`);
    }
    if (fs.existsSync(docsPath)) {
      fail(`docs/${bucket}/${name}.md: "${name}" is in non-promoted bucket "${bucket}" but has a docs page`);
    }
  }
}

if (errors.length) {
  console.error(`validate-skills: ${errors.length} violation(s) found\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`validate-skills: all ${skills.length} skills pass.`);
