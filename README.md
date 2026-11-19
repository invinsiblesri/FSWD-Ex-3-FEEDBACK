# Feedback System

A small feedback collection app built with **React + Vite** and deployed on **Vercel**.

## 🔗 Live Demo

**https://feedback-system-invinsiblesri.vercel.app**

Open the link, fill the form and submit - it works directly in the browser, no backend or sign-in needed.

## Features

- Clean feedback form: name, department, session title, feedback and suggestions
- Optional 1-5 star overall rating
- Reads and validates all input before submitting
- Success screen with a receipt-style confirmation instead of a browser alert
- Responses saved in `localStorage`, with a "Recent responses" panel to review or clear them
- Fully responsive layout (mobile and desktop)
- SPA rewrite configured in `vercel.json`, so any URL loads the app

## Tech Stack

| Layer | Used |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| HTTP client | Axios (only when a backend URL is configured) |
| Hosting | Vercel (static build from `dist/`) |

## Project Structure

```
FSWD-Ex-3-FEEDBACK/
├── index.html          # HTML entry point
├── vercel.json         # Vercel build + SPA rewrite config
├── vite.config.js      # Vite config
├── server.js           # Optional Express + MongoDB backend (local use)
└── src/
    ├── main.jsx        # React bootstrap
    ├── App.jsx         # Feedback form, rating and saved responses
    ├── App.css         # Component styles
    ├── index.css       # Base reset
    └── assets/         # Images and icons
```

## How It Works On Vercel

`vercel.json` pins the build so the deploy is deterministic:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Rewrite:** `/(.*)` → `/index.html` (single page app)

The form decides where to store a response at build time:

1. **No `VITE_API_URL`** (current Vercel setup) - the response is saved in the browser's `localStorage`, so the deployed page works on its own.
2. **`VITE_API_URL` set** - the form also POSTs to `${VITE_API_URL}/api/feedback`, which is what `server.js` serves locally with MongoDB.

Copy `.env.example` to `.env.local` and set `VITE_API_URL` if you want the Express backend.

## Local Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Optional backend (requires a MongoDB URI):

```bash
node server.js
```

## Deployments

Every push to `main` triggers an automatic production deployment on Vercel.

- Production: https://feedback-system-invinsiblesri.vercel.app
- Vercel project: `feedback-system`
