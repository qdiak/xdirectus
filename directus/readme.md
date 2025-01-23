# Directus

Fork of [Directus](https://github.com/directus/directus).

It contains modifications for special needs of us.

## Running locally

- **REST & GraphQL API.** Instantly layers a blazingly fast Node.js API on top of any SQL database.
- **Manage Pure SQL.** Works with new or existing SQL databases, no migration required.
- **Choose your Database.** Supports PostgreSQL, MySQL, SQLite, OracleDB, CockroachDB, MariaDB, and MS-SQL.
- **On-Prem or Cloud.** Run locally, install on-premises, or use our
  [self-service Cloud service](https://directus.io/pricing).
- **Completely Extensible.** Built to white-label, it is easy to customize our modular platform.
- **A Modern Dashboard.** Our no-code Vue.js app is safe and intuitive for non-technical users, no training required.

```
nvm use
```

### 2. Create `.env` file 

Place it under  the `/api` folder!

[Directus Cloud](https://directus.io/pricing) allows you to create projects, hosted by the Directus team, from
$15/month.

- A self-service dashboard to create and monitor all your projects in one place.
- Everything you need: Directus, database, storage, auto-scaling, and a global CDN.
- Select your desired region and provision a new project in ~90 seconds.

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

Directus is made possible with support from our passionate core team, talented contributors, and
amazing [GitHub Sponsors](https://github.com/sponsors/directus). Thank you all!

```
pnpm build
```

## 📄 Understanding Our License

Directus is licensed under [the Business Source License (BSL) 1.1](./license) with a permissive additional use grant. For most users, it operates just like open source! Here's what that means for you:

### Free for Most Users

If your organization has less than $5M in annual revenue and/or funding combined, you can use Directus freely in any way you'd like. Build that side project, launch your startup, or experiment with the platform — no strings attached.

### Enterprise Usage

For larger organizations (>$5M in annual revenue/funding) using Directus in production, we require a commercial license. This model helps us maintain a sustainable balance: keeping Directus free for the majority of our community while ensuring larger organizations who benefit from the platform contribute to its continued development.

### Why This Approach?

We believe in making powerful data tools accessible to everyone. This license lets us:

- Keep Directus free for individuals, startups, and smaller companies
- Maintain active development and strong support
- Continue improving the platform for everyone
- Stay sustainable as an independent project
