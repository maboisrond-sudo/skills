---
name: gmail-notification-cleanup
description: Nettoyer une boite Gmail des notifications recurrentes (GitHub, GitLab, Jira, Slack, etc.) en les marquant lues et en les archivant ou en leur appliquant un libelle.
disable-model-invocation: true
---

Le script fait tout le travail : [scripts/gmail_cleanup.py](scripts/gmail_cleanup.py). Ce fichier documente la mise en place et l'usage.

## 1. Installer les bibliotheques necessaires

```bash
pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## 2. Creer et configurer `credentials.json`

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/).
2. Creer un projet (ou en reutiliser un existant).
3. Menu **APIs et services > Bibliotheque** : rechercher **Gmail API** et cliquer sur **Activer**.
4. Menu **APIs et services > Ecran de consentement OAuth** :
   - Type d'utilisateur : **Externe** (sauf compte Google Workspace, alors **Interne**).
   - Renseigner nom de l'app, e-mail de support et e-mail de contact developpeur.
   - Sous **Utilisateurs de test**, ajouter sa propre adresse Gmail (obligatoire tant que l'app est en mode "Testing").
5. Menu **APIs et services > Identifiants** :
   - **Creer des identifiants > ID client OAuth**.
   - Type d'application : **Application de bureau** (Desktop app).
   - Telecharger le JSON genere.
6. Renommer le fichier telecharge en `credentials.json` et le placer a cote de `gmail_cleanup.py` (ou passer son chemin via `--credentials`).

`credentials.json` ne contient qu'un identifiant client OAuth (pas un mot de passe) mais ne doit pas etre commite ni partage.

## 3. Premiere authentification

Au premier lancement, le script ouvre un navigateur pour se connecter au compte Google et demander la permission `gmail.modify` (lire/modifier les libelles, pas d'envoi d'e-mail). Une fois autorise, un `token.json` est cree a cote du script et reutilise automatiquement pour les executions suivantes (rafraichi tout seul quand il expire).

`token.json` donne acces au compte Gmail au meme titre que `credentials.json` : a garder prive, ne pas commiter.

## 4. Utilisation

Tester sans rien modifier :

```bash
python scripts/gmail_cleanup.py --senders github --dry-run
```

Marquer comme lus et archiver les notifications GitHub non lues :

```bash
python scripts/gmail_cleanup.py --senders github
```

Plusieurs services d'un coup, avec un libelle au lieu d'un archivage :

```bash
python scripts/gmail_cleanup.py --senders github,gitlab,slack --action label --label-name "Notifications"
```

Options utiles :

- `--senders` : presets connus (`github`, `gitlab`, `jira`, `slack`, `trello`, `asana`, `notion`, `sentry`, `circleci`, `linkedin`, `calendly`) et/ou adresses/domaines bruts, separes par des virgules.
- `--query` : termes de recherche Gmail additionnels, ex. `--query "older_than:7d"`.
- `--include-read` : traite aussi les messages deja lus (par defaut seuls les non-lus sont vises).
- `--action archive` (defaut) retire le message de la boite de reception ; `--action label --label-name NOM` cree le libelle s'il n'existe pas et l'applique (et archive aussi, sauf `--keep-in-inbox`).
- `--max-results N` : limite le nombre de messages traites.

## 5. Automatiser (optionnel)

Une fois `token.json` genere, le script tourne sans interaction. Il peut etre planifie via cron (Linux/Mac) ou le Planificateur de taches (Windows), par exemple toutes les heures :

```cron
0 * * * * cd /chemin/vers/le/script && python gmail_cleanup.py --senders github,gitlab
```
