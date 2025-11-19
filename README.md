# WorkFlicks CMS

WorkFlicks CMS is an operations console for managing the WorkFlicks.in job marketplace. The stack couples a Next.js 14 frontend (deployable to Vercel) with Firebase serverless services (Auth, Firestore, Cloud Functions, Storage) to deliver a secure, role-aware content system.

## Features

- **Role-based access control** built on Firebase Auth custom claims (super admin, admin, recruiter, content editor, viewer).
- **Job and company management** with structured Firestore collections, typed Zod validation, and sanitation triggers.
- **Secure APIs** backed by Firebase Admin on the server and Firestore security rules enforcing least-privilege access.
- **Team provisioning** to issue roles, update claims, and synchronize portal user profiles.
- **Operational analytics** surfacing job, company, and team coverage at a glance.
- **Cloud Functions** for automatic claim seeding, input sanitization, and email notifications when jobs go live.

## Getting Started

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create a `.env.local` file using `.env.example` as a template and supply Firebase project credentials plus a service account with admin access.

3. Run the development server.

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` to access the CMS. Use Firebase Auth email/password or Google Sign-In.

## Testing

Vitest powers unit tests for RBAC logic.

```bash
npm test
```

## Firebase Setup

- Deploy Firestore and Storage security rules:

  ```bash
  firebase deploy --only firestore:rules,storage:rules
  ```

- Deploy Cloud Functions (with optional SendGrid alerts):

  ```bash
  cd functions
  npm install
  npm run build
  firebase deploy --only functions
  ```

  Configure SendGrid with:

  ```bash
  firebase functions:config:set alerts.to="ops@workflicks.in" alerts.from="noreply@workflicks.in" defaults.role="viewer"
  firebase functions:config:set sendgrid.api_key="YOUR_KEY"
  ```

## Firestore Data Model

| Collection     | Purpose                                   |
| -------------- | ----------------------------------------- |
| `jobs`         | Job postings managed by recruiters/admins |
| `companies`    | Hiring companies and metadata             |
| `portalUsers`  | CMS team roster with roles/claims         |

## Deployment

- Vercel: `npm run build` followed by `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-8a869811`.
- Firebase Hosting (optional static assets): see `firebase.json` for configuration defaults.

## Environment Variables

See `.env.example` for the full list covering Firebase client and admin credentials.
