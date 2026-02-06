# fisherfans (PostgreSQL)

Configuration minimale d’une base PostgreSQL `fisherfans` exposée sur `localhost:5432`.

## Variables

Les variables demandées sont dans `.env` :

- `DATABASE_HOST=localhost`
- `DATABASE_PORT=5432`
- `DATABASE_USER=fisherfans`
- `DATABASE_PASSWORD=fisherfans`
- `DATABASE_NAME=fisherfans`

## Lancer la base (Docker)

```bash
cd /c/Users/zaher/Documents/YNOV/databases

docker compose up -d
```

## Tester (optionnel)

Si tu as `psql` installé :

```bash
psql "postgresql://fisherfans:fisherfans@localhost:5432/fisherfans"
```

## Arrêter

```bash
docker compose down
```
