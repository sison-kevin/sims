# SIMS — Stock & Inventory Management System

A full‑stack inventory and sales management web app built with Next.js. It provides user authentication, product and stock management, sales recording, and basic analytics — designed as a portfolio-ready project demonstrating modern web practices.

## Features

- **Authentication**: secure sign-in and role-aware access (admin / user)
- **Product management**: create, update, and organize products and SKUs
- **Inventory control**: track stock levels, restocking, and constraints
- **Sales management**: create and record sales with linked inventory adjustments
- **Analytics**: summary metrics and recent activity feed
- **Admin UI**: settings, user management, and audit logs
- **API routes**: server-side logic with typed inputs and validation
- **Developer tooling**: seed scripts, database migrations, and local test helpers

## Tech Stack

- **Frontend**: Next.js (App Router) + React + TypeScript
- **Backend**: Next.js API routes, Node.js server runtime
- **Database & ORM**: Prisma with a relational database (Postgres recommended)
- **Auth / Edge Services**: Supabase (client + admin helpers) and server-side session helpers
- **Tooling**: ESLint, PostCSS, Vercel for deployment
- **Other**: Utility scripts for seeding and DB checks (see `scripts/`)

## Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/sison-kevin/sims.git
   cd sims-portfolio
   npm install
   # or
   yarn
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Apply migrations and seed (Prisma)**
   ```bash
   npx prisma migrate dev --name init
   node scripts/seed-demo.js
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Environment Variables

Create `.env.local` with the keys your platform requires. Example entries:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
NEXTAUTH_SECRET="a-long-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Only include secrets in server-side environment settings (Vercel environment variables or server `.env`), never commit them.

## Folder Structure

- `app/` — Next.js routes (App Router), pages and nested layouts
- `components/` — UI components and feature-specific compositions
- `lib/` — helpers (auth, prisma client, formatting, utils)
- `prisma/` — Prisma schema and migrations
- `public/` — static assets
- `scripts/` — helper scripts (seed, db checks)
- `styles/` or `globals.css` — global styles and PostCSS config

## Usage / How it Works

- UI components in `app/` and `components/` render the frontend and call internal API routes.
- API routes handle server logic, use `lib/prisma.ts` or Supabase helpers to access the database.
- Authentication uses Supabase client for sign-in flows; sensitive operations are performed server-side.
- Prisma manages schema and migrations; scripts seed demo data for local development.
- The app follows common full‑stack patterns: typed requests, server-side data fetching, and component-driven UI.

## Deployment

Vercel is an ideal host for this Next.js app:

1. Connect the GitHub repo to Vercel
2. Set environment variables (`DATABASE_URL`, Supabase keys) in the Vercel project settings
3. Enable automatic deployments on push to `main`
4. Run Prisma migrations (or enable a post-deploy migration step) and seed data as needed

## Future Improvements

- Add end-to-end tests (Cypress / Playwright) and CI (GitHub Actions)
- Role-based permissions and finer audit trails
- Real-time inventory updates via WebSockets or Supabase Realtime
- Improve accessibility and internationalization (i18n)
- Add more analytics dashboards and exportable reports
- Automated deployment scripts for DB migrations and seed
