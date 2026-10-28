# FM Radio Central Admin Portal

A fullstack web administration portal for Tamil, Hindi, and Malayalam FM stations. Built with a React/Vite frontend and an Express/Node.js backend secured with Google Auth and JWT.

## Architecture

- **`frontend/`**: React 19 + Vite dashboard (Channel manager, Reports center, Version controller, Admin access).
- **`backend/`**: Express API connected to Supabase PostgreSQL, JWT auth, and Cloudflare R2 / Images storage.
- **`api/index.js`**: Serverless function bridge for Vercel deployment.
- **`vercel.json`**: Unified fullstack routing configuration.

## Running Locally

1. **Install Dependencies**:
   ```bash
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. **Run Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Run Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Deploying to Vercel

Run the following command at the root directory:
```bash
npx vercel
```
Or connect the repository directly in [Vercel](https://vercel.com/new). Add the environment variables from `backend/.env` to your Vercel Project Settings.
