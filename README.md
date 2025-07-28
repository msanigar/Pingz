# Pingz

> A raw, real-time, IRC-inspired chat app. Built with React 19, Convex, and Bun.

## Stack

- ⚛️ React 19 + Vite + TypeScript
- 💨 Tailwind CSS
- 🧠 Zustand for client state
- 🔒 Clerk for authentication
- 🛰️ Convex for backend, real-time data, and DB
- ⚡️ Bun for dev/build tooling
- ☁️ Hosted on Netlify (frontend) + Convex (backend)

## Features

- 💬 Real-time messaging with IRC-style UI
- 😊 Emoji reactions with toggle behavior
- 🏠 Multiple channels (#general, #random, #dev) + custom channels
- 📎 File/image uploads (up to 10MB)
- 🔍 Message search with highlighting
- 👥 Online user tracking
- 📱 Mobile responsive design

## Dev

```bash
bun install
bun dev        # Vite frontend
npx convex dev # Local backend
```

## Environment Variables

Create `.env.local` with:

```bash
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key

# Convex Configuration  
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repo to Netlify
2. Set build command: `bun run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Backend (Convex)
```bash
npx convex deploy  # Deploys to production
```

### Clerk Setup
1. Create Clerk application
2. Add production domain to allowed origins
3. Create JWT template named "convex"
4. Update environment variables with production keys

## Admin Commands

```bash
# Clear all data (development only)
npx convex run admin:clearAllData

# Clear only messages
npx convex run admin:clearMessages
```
