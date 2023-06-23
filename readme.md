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

### 4. Use the right npm version

```
nvm use
```

### 5. Initialize dabatase

```
pnpm --filter au_directus_api cli bootstrap
```

### 6. Build app, and run the api

```
pnpm --filter au_directus_app build && pnpm --filter au_directus_api dev
```

> There is no watch mode for the app, so it should be rerunned after every app changes.

#### Update quantum dependency manually
```
cp -a app/dist ../quantum_ugyvitel/node_modules/au_directus_app && \
cp -a api/dist ../quantum_ugyvitel/node_modules/au_directus_api
```

## Publishing the npm package

### 1. Increase version

1. `package.json` -> `{ "version': "1.0.x", [...] }`
1. `api/package.json` -> `{ "version': "1.0.x", [...] }`
1. `app/package.json` -> `{ "version': "1.0.x", [...] }`

### 2. Build & publish

> Replace the NPM auth token that defines the target account.

```
pnpm -r build && \
NODE_AUTH_TOKEN=[...] \
pnpm \
--filter au_directus_app \
--filter au_directus_api \
--filter au_directus \
publish --access=public --no-git-checks
```