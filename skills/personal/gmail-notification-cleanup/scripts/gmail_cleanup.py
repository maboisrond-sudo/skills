#!/usr/bin/env python3
"""Mark recurring notification emails (GitHub, GitLab, CI, etc.) as read and
either archive them or apply a label, using the Gmail API.

Setup instructions live in ../SKILL.md.
"""

from __future__ import annotations

import argparse
import os
import sys

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

# Known notification senders, grouped under a short preset name so
# --senders github,gitlab,ci is enough instead of typing full addresses.
SENDER_PRESETS = {
    "github": ["notifications@github.com"],
    "gitlab": ["notifications@gitlab.com"],
    "jira": ["jira@*.atlassian.net"],
    "slack": ["notifications@slack.com", "feedback@slack.com"],
    "trello": ["notifications@trello.com"],
    "asana": ["notifications@asana.com"],
    "notion": ["team@mail.notion.so"],
    "sentry": ["notifications@sentry.io"],
    "circleci": ["notifications@circleci.com"],
    "linkedin": ["notifications-noreply@linkedin.com", "jobs-noreply@linkedin.com"],
    "calendly": ["notifications@calendly.com"],
}

BATCH_LIMIT = 1000  # Gmail API cap for a single batchModify call.


def get_service(credentials_path: str, token_path: str):
    creds = None
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_path):
                sys.exit(
                    f"Fichier introuvable : {credentials_path}\n"
                    "Voir SKILL.md pour la marche a suivre (creation des identifiants OAuth)."
                )
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, "w") as token_file:
            token_file.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def build_query(senders: list[str], unread_only: bool, extra_query: str | None) -> str:
    terms = []
    for token in senders:
        if token in SENDER_PRESETS:
            terms.extend(SENDER_PRESETS[token])
        else:
            terms.append(token)

    from_clause = " OR ".join(f"from:{term}" for term in terms)
    parts = [f"({from_clause})"] if terms else []
    if unread_only:
        parts.append("is:unread")
    if extra_query:
        parts.append(extra_query)
    return " ".join(parts)


def list_message_ids(service, query: str, max_results: int | None):
    message_ids = []
    page_token = None
    while True:
        remaining = None if max_results is None else max_results - len(message_ids)
        if remaining is not None and remaining <= 0:
            break
        page_size = 500 if remaining is None else min(500, remaining)
        response = (
            service.users()
            .messages()
            .list(userId="me", q=query, pageToken=page_token, maxResults=page_size)
            .execute()
        )
        message_ids.extend(msg["id"] for msg in response.get("messages", []))
        page_token = response.get("nextPageToken")
        if not page_token:
            break
    return message_ids


def get_or_create_label_id(service, label_name: str) -> str:
    labels = service.users().labels().list(userId="me").execute().get("labels", [])
    for label in labels:
        if label["name"].lower() == label_name.lower():
            return label["id"]

    created = (
        service.users()
        .labels()
        .create(
            userId="me",
            body={
                "name": label_name,
                "labelListVisibility": "labelShow",
                "messageListVisibility": "show",
            },
        )
        .execute()
    )
    return created["id"]


def chunked(items: list[str], size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def apply_actions(
    service,
    message_ids: list[str],
    action: str,
    label_id: str | None,
    keep_in_inbox: bool,
    dry_run: bool,
):
    if not message_ids:
        print("Aucun message ne correspond a la recherche.")
        return

    remove_label_ids = ["UNREAD"]
    add_label_ids = []

    if action == "archive":
        remove_label_ids.append("INBOX")
    else:  # action == "label"
        add_label_ids.append(label_id)
        if not keep_in_inbox:
            remove_label_ids.append("INBOX")

    if dry_run:
        print(
            f"[dry-run] {len(message_ids)} message(s) recevraient : "
            f"add={add_label_ids or '-'} remove={remove_label_ids}"
        )
        return

    for batch in chunked(message_ids, BATCH_LIMIT):
        body = {"ids": batch, "removeLabelIds": remove_label_ids}
        if add_label_ids:
            body["addLabelIds"] = add_label_ids
        service.users().messages().batchModify(userId="me", body=body).execute()

    print(f"{len(message_ids)} message(s) traite(s).")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Recherche les e-mails de notifications recurrentes dans Gmail, "
            "les marque comme lus, puis les archive ou leur applique un libelle."
        )
    )
    parser.add_argument(
        "--credentials",
        default="credentials.json",
        help="Chemin du fichier credentials.json (defaut: ./credentials.json)",
    )
    parser.add_argument(
        "--token",
        default="token.json",
        help="Chemin du fichier token.json genere apres la premiere authentification",
    )
    parser.add_argument(
        "--senders",
        default="github",
        help=(
            "Liste separee par des virgules : presets connus ("
            + ", ".join(sorted(SENDER_PRESETS))
            + ") et/ou adresses ou domaines bruts (ex: notifications@github.com)"
        ),
    )
    parser.add_argument(
        "--query",
        default=None,
        help="Termes de recherche Gmail additionnels (ex: 'older_than:7d')",
    )
    parser.add_argument(
        "--include-read",
        action="store_true",
        help="Traiter aussi les messages deja lus (par defaut seuls les non-lus sont vises)",
    )
    parser.add_argument(
        "--action",
        choices=["archive", "label"],
        default="archive",
        help="Action a appliquer apres avoir marque les messages comme lus (defaut: archive)",
    )
    parser.add_argument(
        "--label-name",
        default=None,
        help="Nom du libelle a appliquer (requis si --action=label)",
    )
    parser.add_argument(
        "--keep-in-inbox",
        action="store_true",
        help="Avec --action=label, ne pas retirer le message de la boite de reception",
    )
    parser.add_argument(
        "--max-results",
        type=int,
        default=None,
        help="Nombre maximum de messages a traiter (defaut: tous)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="N'applique aucune modification, affiche seulement ce qui serait fait",
    )

    args = parser.parse_args(argv)
    if args.action == "label" and not args.label_name:
        parser.error("--label-name est requis quand --action=label")
    return args


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    senders = [s.strip() for s in args.senders.split(",") if s.strip()]
    query = build_query(senders, unread_only=not args.include_read, extra_query=args.query)
    print(f"Recherche Gmail : {query!r}")

    service = get_service(args.credentials, args.token)

    try:
        message_ids = list_message_ids(service, query, args.max_results)
        label_id = None
        if args.action == "label":
            label_id = get_or_create_label_id(service, args.label_name)
        apply_actions(
            service,
            message_ids,
            action=args.action,
            label_id=label_id,
            keep_in_inbox=args.keep_in_inbox,
            dry_run=args.dry_run,
        )
    except HttpError as error:
        sys.exit(f"Erreur API Gmail : {error}")


if __name__ == "__main__":
    main()
