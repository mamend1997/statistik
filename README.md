# VolleyDesk

VolleyDesk is a mobile-friendly volleyball extracurricular management app. Its demo login and operational data are kept in the current browser; the Node.js service only serves the app.

## Run locally

1. Install Node.js 18 or newer.
2. Install dependencies and start the app:

   ```sh
   npm install
   npm start
   ```

3. Open `http://localhost:3000`.

The first browser visit creates a sample administrator:

- Email: `admin@volleydesk.demo`
- Password: `VoliDesk!2026`

Change the password after signing in using **Ubah sandi**. The browser stores a PBKDF2 hash, but this is still demo-only authentication: browser storage and role checks can be changed by the user and are not suitable for protecting real student data.

## Deploy to Railway

The project deploys as one Node.js web service with no separate database service. Railway uses `npm start` and supplies the dynamic `PORT`. GitHub auto-deploys are configured for the `main` branch.

This reduces Railway resources but does not guarantee zero charges; review your Railway plan and usage. Login accounts, changed passwords, and team data are browser-specific and do not synchronize across devices or reliably survive clearing browser storage. Use a server-side database and authorization before using real student records.
