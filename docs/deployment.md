# Deployment

Mochi Social uses a split deployment boundary.

- The future Vercel website hosts the site, account UI, Supabase session management, and game launch/embed surface.
- The Mochi Social game repo deploys the multiplayer RPG runtime to Fly.io.

## Why Fly.io for the Game

The game runtime needs a long-lived server process and multiplayer transport. Vercel Functions are not the game WebSocket server, so Vercel should only reference the deployed game URL.

## Fly Setup

```powershell
fly launch --no-deploy --name mochi-social-game
fly volumes create mochi_social_data --size 1 --region sea
fly secrets set SUPABASE_URL="..." SUPABASE_PUBLISHABLE_KEY="..."
fly deploy
```

Runtime env defaults:

- `PORT=8080`
- `RPG_SAVE_DIR=/data/saves`
- `SUPABASE_AUTH_REQUIRED=false`
- `RPG_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`

Add the future Vercel domain to `RPG_ALLOWED_ORIGINS` before embedding in production.
