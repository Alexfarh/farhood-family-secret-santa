# Auto-commit Setup for Wishlist Updates

To enable automatic git commits when wishlists are updated, you need to add a GitHub token to Vercel.

## Setup Instructions

1. **Create a Personal Access Token on GitHub:**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "Vercel Auto-Commit"
   - Select scopes:
     - `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't be able to see it again)

2. **Add to Vercel Environment Variables:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your "farhood-family-secret-santa" project
   - Go to **Settings** → **Environment Variables**
   - Click **Add**
   - Name: `GITHUB_TOKEN`
   - Value: Paste the token you just created
   - Click **Save**

3. **Redeploy on Vercel:**
   - Go to **Deployments** tab
   - Click the three dots on your latest deployment
   - Select **Redeploy**

## How It Works

1. Someone submits a wishlist on your site
2. The API updates the in-memory data
3. The API directly commits the changes to GitHub via the GitHub API
4. The updated `data/secret-santa.json` is now in git
5. Next Vercel redeploy will pull the latest data

**No manual commits needed!** 🎉

