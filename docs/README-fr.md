# Présentation du projet

**skills** est le dépôt personnel de Matt Pocock : une collection de *skills* (compétences packagées) destinées aux agents de codage comme Claude Code, pensées pour un usage d'ingénierie réel — pas du "vibe coding".

## Pourquoi ce projet existe

Les agents de codage échouent souvent de trois façons : ils font autre chose que ce qu'on attendait, ils sont trop verbeux, ou le code produit ne fonctionne pas vraiment. Chaque *skill* du dépôt répond à l'un de ces problèmes par une pratique reproductible — interroger l'utilisateur avant de coder, construire un langage partagé avec le projet, ou driver le développement en boucle rouge-vert.

## Comment c'est organisé

Les skills sont rangées dans des dossiers-buckets sous `skills/` :

- **`engineering/`** — le travail de code au quotidien (grilling, TDD, revue de code, triage…)
- **`productivity/`** — les outils de flux de travail non liés au code
- **`misc/`** et **`personal/`** — gardées mais non mises en avant
- **`in-progress/`** — des brouillons pas encore prêts
- **`deprecated/`** — plus utilisées

Seules les deux premiers buckets (`engineering/`, `productivity/`) sont *promus* : chacune de leurs skills apparaît dans le `README.md` racine, dans `.claude-plugin/plugin.json`, et a sa propre page de documentation publiée sur [aihero.dev](https://aihero.dev).

## Deux façons de les invoquer

- **User-invoked** — on les tape soi-même (ex. `/grill-me`) ; l'agent ne les déclenche jamais seul.
- **Model-invoked** — l'agent peut les mobiliser automatiquement quand la tâche s'y prête.

Le point d'entrée pour s'y retrouver est [`ask-matt`](https://aihero.dev/skills-ask-matt), qui route vers la bonne skill selon la situation.

## Pour commencer

```bash
npx skills@latest add mattpocock/skills
```

Puis lancer `/setup-matt-pocock-skills` pour configurer le suivi de tickets et les préférences du dépôt.
