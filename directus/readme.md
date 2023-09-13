# Quantum Directus

Fork of [Directus](https://github.com/directus/directus).

It contains modifications for special needs of Quantum Iskolaszövetkezet.

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

### 4. Install

Installnál maradjanak az eredeti verziószámok, különben nem fogja megtalálni a local package-eke a workspace-ben!

```
pnpm i
```

### 4.1. Build

A boostrtap dist-ből használja a shared-et.

```
pnpm build
```

### 5. Initialize dabatase

Legyen létrehozva, és elérhetp az üres db az env fájlban megadottak alapján.

```
pnpm --filter quantum_directus_api cli bootstrap
```

### 6. Build app, and run the api

```
pnpm --filter quantum_directus_app build && pnpm --filter quantum_directus_api dev
```

> There is no watch mode for the app, so it should be rerunned after every app changes.

#### Update quantum dependency manually
```
cp -a app/dist ../quantum_ugyvitel/node_modules/quantum_directus_app && \
cp -a api/dist ../quantum_ugyvitel/node_modules/quantum_directus_api
```

## Publishing the npm package

### 1. Increase version

1. `package.json` -> `{ "version': "1.0.x", [...] }`
1. `api/package.json` -> `{ "version': "1.0.x", [...] }`
1. `app/package.json` -> `{ "version': "1.0.x", [...] }`

### 2. Build & publish

> Replace the NPM auth token that defines the target account.

> NPM Access token must be a Classic Automation Access Token.

```
pnpm -r build && \
NODE_AUTH_TOKEN=[...] \
pnpm \
--filter quantum_directus_app \
--filter quantum_directus_api \
--filter quantum_directus \
publish --access=public --no-git-checks
```