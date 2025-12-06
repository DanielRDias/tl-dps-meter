# Production Environment Setup

## Problem

When building for production, Vite needs access to environment variables at build time. The `dotenv-cli` approach doesn't work in cloud environments like AWS Amplify where the `.env.production` file isn't available.

## Solution

In production environments, set environment variables as system/platform environment variables instead of relying on `.env.production` files.

### For AWS Amplify

#### Step 1: Set Build Environment Variables

1. Go to **AWS Amplify Console** → Your App
2. Click **Build settings** in the left sidebar
3. Scroll to **Environment variables** section
4. Click **Manage all environments** or **Add environment variable**
5. Add the following variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://api.drop-rate.com` |
   | `DB_HOST` | `your-instance.xxxxx.rds.amazonaws.com` |
   | `DB_PORT` | `5432` |
   | `DB_USER` | `dpsadmin` |
   | `DB_PASSWORD` | `your_secure_password` |
   | `DB_NAME` | `dpsmeter_db` |

6. Click **Save** after adding all variables

#### Step 2: Configure Build Commands

1. Still in **Build settings**, scroll to **Build image settings**
2. Ensure build commands are configured:
   - **Pre-build command:** `npm ci --cache .npm --prefer-offline`
   - **Build command:** `npm run build`

   ⚠️ **IMPORTANT:** Do NOT use `dotenv -e .env.production` in the build command. This will fail because:
   - `dotenv-cli` is not installed in production
   - `.env.production` files don't exist in AWS environment
   - Environment variables are already set in Amplify Console

3. Click **Save** after updating build commands

#### Step 3: Deploy

1. Amplify will automatically rebuild with the new environment variables
2. Or manually trigger a deployment by pushing to your connected Git branch
3. Monitor the build logs to ensure it completes successfully

#### Verifying the Deployment

After deployment completes:

2. Go to your app URL and open **Developer Console (F12)**
3. Go to **Network** tab and refresh the page
3. Look for API calls to verify they're going to `https://api.drop-rate.com` instead of `localhost`

**View Build Logs:**
- Click **Deployments** in Amplify Console
- Click the deployment to see detailed build logs
- If you see "dotenv: command not found", your build command still has `dotenv` in it - remove it!

### For Docker / Local Production Build

Create a `.env.production` file locally before building:

```bash
cat > .env.production << EOF
VITE_API_URL=https://api.drop-rate.com
DB_HOST=your-instance.xxxxx.rds.amazonaws.com
DB_PORT=5432
DB_USER=dpsadmin
DB_PASSWORD=your_secure_password
DB_NAME=dpsmeter_db
EOF

npm run build
```

## How It Works

1. **Build Time:** Vite's `vite.config.ts` loads environment variables using `loadEnv()`
2. **Variable Injection:** `VITE_API_URL` is injected into the build as `import.meta.env.VITE_API_URL`
3. **Runtime:** The frontend JavaScript uses the injected value to connect to your production API

## Verifying Environment Variables

To verify the correct values were injected:

1. **After build**, check the generated HTML:
   ```bash
   grep "localhost" dist/index.html
   # Should return nothing if production URLs were used
   
   grep "your-api-domain" dist/index.html
   # Should show your production API URL
   ```

2. **Or check the JavaScript bundle:**
   ```bash
   grep -r "your-api-domain" dist/assets/
   # Should show your production API URL injected in the bundle
   ```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Frontend API endpoint | `https://api.drop-rate.com` |
| `DB_HOST` | PostgreSQL server | `instance.xxxxx.rds.amazonaws.com` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `dpsadmin` |
| `DB_PASSWORD` | PostgreSQL password | `your_secure_password` |
| `DB_NAME` | PostgreSQL database | `dpsmeter_db` |
| `PORT` | Backend server port | `3001` |
| `BASE_URL` | Frontend base URL | `https://your-domain.com` |

## Troubleshooting

### Frontend Still Connecting to localhost

**Cause:** Environment variables not set in build environment

**Solution:**
1. Verify environment variables are set in your deployment platform (Amplify, EB, etc.)
2. Check that variable names match exactly (case-sensitive)
3. Rebuild: `npm run build`
4. Check `dist/index.html` for correct URLs

### Backend Connection Fails

**Cause:** `DB_HOST`, `DB_USER`, or `DB_PASSWORD` not set in server environment

**Solution:**
1. Ensure backend server has environment variables (from `.env.production` or platform settings)
2. Check PostgreSQL instance is accessible from your deployment region
3. Verify security groups allow port 5432 from your application
