# VolleyDesk

VolleyDesk is a mobile-friendly volleyball extracurricular management app. The static frontend is served by an Express server; login accounts and sessions are stored in PostgreSQL.

## Run locally

1. Install Node.js 18 or newer and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a unique `SESSION_SECRET` (at least 32 characters), and the initial administrator name, email, and password (at least 12 characters).
3. Install dependencies and start the app:

   ```sh
   npm install
   npm start
   ```

On first startup, VolleyDesk creates its account and session tables and bootstraps the administrator. Remove `BOOTSTRAP_ADMIN_PASSWORD` from the deployment environment after the initial account is created. The administrator can then add accounts for coaches and school staff from **Pengaturan akses**.

## Deploy to Railway

1. Add a PostgreSQL service to the Railway project.
2. Deploy this repository as a Node.js service. Railway uses the `npm start` command and supplies the dynamic `PORT`.
3. Set `DATABASE_URL` to the PostgreSQL service connection URL.
4. Set `SESSION_SECRET` to a persistent, randomly generated secret. For example, generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.
5. Before the first deployment, set `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and a strong `BOOTSTRAP_ADMIN_PASSWORD`. Remove the password variable after the administrator has been created.

The server uses HTTP-only, same-site session cookies, password hashing, login rate limiting, and admin checks for account management.

## Data storage note

Player profiles, attendance, schedules, and match statistics are still stored in browser `localStorage`; only user accounts and sessions are in PostgreSQL. This login gates the UI, but it does not yet provide shared team data or server-side authorization for those operational records. Move those records to authenticated, role-checked API endpoints before using the app for confidential student data across multiple users.
