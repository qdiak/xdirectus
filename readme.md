# Quantum Directus

## Running locally

### 1. Make sure You use the right npm version

```
nvm use
```

### 2. Create `.env` file 

Place it under  the `/api` folder!

```
HOST="localhost"
PORT=8055
BE_PORT=8055
API_URL="http://0.0.0.0:8055"

DB_CLIENT="pg"
DB_HOST="localhost"
DB_PORT=5432
DB_DATABASE="db3"
DB_USER="aw"
DB_PASSWORD="password"

SERVE_APP=true

KEY="..."
SECRET="..."

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"
```

### 3. Export the variables

```
set -o allexport; source api/.env; set +o allexport
```

### 4. Build app, and run the api

```
pnpm --filter au_directus_app build && pnpm --filter au_directus dev
```

> There is no watch mode for the app, so it should be rerunned after every app changes.

## Publishing the npm package

### 1. Increase the version numbers

`api/package.json` -> `version`
`app/package.json` -> `version`

### 2. Build & publish

> Replace the NPM auth token that defines the target account.

```
pnpm -r build && \
NODE_AUTH_TOKEN=[...] \
pnpm --filter au_directus --filter au_directus_app publish --access=public --no-git-checks
```