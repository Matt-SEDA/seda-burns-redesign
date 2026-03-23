# SEDA Burns Dashboard

Live chain revenue and SEDA token burn tracking. Next.js + Recharts + Tailwind. Deploys to Vercel, embeds into Framer.

## Quick Start

### 1. Push to GitHub

```bash
cd seda-burns-dashboard
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/seda-burns-dashboard.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Framework Preset: **Next.js** (auto-detected)
3. Add environment variable: `ADMIN_PASSWORD` = your secret password
4. Deploy!

### 3. Admin Page

Visit `https://your-app.vercel.app/admin` and log in with your password to add daily records, update Fast Requests Sold, or delete bad entries.

### 4. Embed in Framer

Add a **Code Component** in Framer and paste:

```tsx
import { useEffect, useRef } from "react"

export default function SEDADashboard({ width = "100%", height = 600 }) {
  const ref = useRef<HTMLIFrameElement>(null)
  return (
    <iframe
      ref={ref}
      src="https://your-app.vercel.app"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        border: "none",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#09090b",
      }}
      allow="clipboard-write"
    />
  )
}
```

Replace `your-app.vercel.app` with your actual Vercel URL.

## Data Persistence Note

Vercel serverless functions have ephemeral file systems. Admin edits to `data.json` may reset on cold starts. To make data permanent, periodically commit the data:

```bash
curl -s https://your-app.vercel.app/data.json -o public/data.json
git add public/data.json && git commit -m "Update burn data" && git push
```

For a zero-maintenance solution, consider migrating to Vercel KV (free tier: 30k requests/month).

## Data Format

```json
{
  "records": [
    { "date": "2026-03-22", "seda": 39973, "usd": 803.86, "price": 0.02011 }
  ],
  "fastRequestsSold": 0,
  "lastUpdated": "2026-03-22"
}
```
