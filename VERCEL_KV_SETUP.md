# Vercel KV Setup Guide

Your Secret Santa app is now configured to use **Vercel KV** (Redis) on production and **file-based storage** for local development.

## Local Development

No setup needed! The app automatically uses `data/secret-santa.json` for storage when running locally.

### Running locally:
```bash
npm run dev
```

Data persists in the `data/` folder across server restarts.

---

## Production Deployment (Vercel)

### Step 1: Create Vercel KV Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your Secret Santa project
3. Go to the **Storage** tab
4. Click **Create Database** → **KV**
5. Name it something like "secret-santa-kv"
6. Select your region (closest to you)
7. Click **Create**

### Step 2: Copy Environment Variables

After creating the KV database, Vercel automatically adds these environment variables to your project:

- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

You can verify they're there:
1. Go to **Settings** → **Environment Variables**
2. Check that all `KV_*` variables are listed

### Step 3: Deploy

```bash
git push  # or deploy through Vercel dashboard
```

The app will automatically detect the KV environment variables and use them instead of file storage.

### Step 4: Verify It Works

1. Visit your deployed app on Vercel
2. Initialize the Secret Santa assignments (via password entry or API)
3. Check the Vercel dashboard's KV storage to see the data was saved

---

## Data Format

Your Secret Santa data is stored as a single JSON object in Redis:

```json
{
  "passwords": {
    "aBc12345": "Alex",
    "xYz67890": "Barb"
  },
  "secretSanta": {
    "Alex": ["Barb", ["Book", "Coffee Mug"]],
    "Barb": ["Alex", []]
  },
  "lastInitialized": "2025-12-07T12:00:00.000Z"
}
```

---

## Troubleshooting

### "KV_URL not found" error
- Make sure you created the KV database in Vercel
- Check that environment variables are set in project settings
- Redeploy after adding environment variables

### Data disappeared after redeploy
- Check Vercel's Storage tab to verify the KV database still exists
- Make sure you're using the same project/environment

### Want to reset data?
Visit your Vercel dashboard → Storage → KV → Delete the data or use the `clearData()` function from the API

---

## Cost

Vercel KV free tier:
- **10,000 commands/day** (plenty for a small family Secret Santa!)
- Free tier should cover the entire event

Your usage will be minimal since you only write data once at initialization and a few times for wish list updates.

---

## Switching back to file-based storage

If you ever want to switch back to local file storage, just remove the KV environment variables and the app will automatically use `data/` folder.
