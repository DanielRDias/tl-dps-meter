# Environment Configuration Guide

## Overview

The project uses separate environment files for development and production builds:

- **`.env.dev`** - Development configuration (SQLite, local API)
- **`.env.production`** - Production configuration (PostgreSQL AWS RDS, production API)
- **`.env.example`** - Template for production configuration
- **`.env.dev.example`** - Template for development configuration

## Development Setup

When you run `npm run dev`, the application loads `.env.dev`:

```bash
npm run dev
# Loads: .env.dev
# Database: SQLite (local file: ./dps_shares.db)
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### `.env.dev` - Development Configuration
```dotenv
NODE_ENV=development
VITE_API_URL=http://localhost:3001
PORT=3001
BASE_URL=http://localhost:5173
DB_PATH=./dps_shares.db
```

**To set up development:**
1. Copy `.env.dev.example` to `.env.dev` (or use the existing one)
2. No additional configuration needed
3. Run `npm run dev`

## Production Build

When you build for production with `npm run build`, the application loads `.env.production`:

```bash
npm run build
# Loads: .env.production
# Database: PostgreSQL on AWS RDS
# Frontend: https://your-domain.com
# Backend: https://api.your-domain.com
```

### `.env.production` - Production Configuration
```dotenv
VITE_API_URL=https://api.your-domain.com
BASE_URL=https://your-domain.com
PORT=3001
DB_HOST=your-instance.xxxxx.rds.amazonaws.com
DB_PORT=5432
DB_USER=dpsadmin
DB_PASSWORD=your_secure_password
DB_NAME=dpsmeter_db
```

**To set up production:**
1. Copy `.env.example` to `.env.production`
2. Fill in your AWS RDS connection details
3. Run `npm run build` to create a production build

## Git Security

Both environment files are ignored by git:

```gitignore
.env          # Ignored - production secrets
.env.dev      # Ignored - development secrets
.env.production  # Ignored - production secrets (if named .env)
```

**Templates are committed for reference:**
- ✅ `.env.example` - Committed (no secrets)
- ✅ `.env.dev.example` - Committed (no secrets)

## File Structure

```
.
├── .env.dev              # ← Your local development config (not in git)
├── .env.dev.example      # ← Template for development (in git)
├── .env.production       # ← Your production config (not in git)
├── .env.example          # ← Template for production (in git)
└── .gitignore            # ← Ensures .env* are not tracked
```

## Database Selection

The backend automatically selects the database based on environment variables:

### Development (with `.env.dev`)
- No `DB_HOST`, `DB_USER`, `DB_PASSWORD` → Uses **SQLite**
- File: `./dps_shares.db`

### Production (with `.env.production`)
- Has `DB_HOST`, `DB_USER`, `DB_PASSWORD` → Uses **PostgreSQL**
- Connection: AWS RDS instance

## Individual Component Scripts

You can run individual components with specific env files:

```bash
# Frontend only (development)
npm run dev:frontend

# Backend only (development)
npm run dev:server

# Build for production
npm run build

# Start production server
npm start
```

## Migration from Development to Production

1. **Test locally with `.env.dev`:**
   ```bash
   npm run dev
   ```

2. **Create production configuration:**
   - Copy `.env.example` to `.env.production`
   - Add your AWS RDS details
   - Never commit `.env.production` to git

3. **Build for production:**
   ```bash
   npm run build
   # Creates optimized dist/ folder with PostgreSQL configured
   ```

4. **Deploy the dist/ folder:**
   - Push to AWS Amplify, Elastic Beanstalk, or EC2
   - Environment automatically uses PostgreSQL based on `.env.production`

## Troubleshooting

### "Database is locked" error in development
- Normal with SQLite during concurrent access
- Use PostgreSQL for production or multi-instance deployments

### Backend uses PostgreSQL during development
- Check if `.env` or `.env.production` exists in root
- Delete it or ensure only `.env.dev` is loaded
- Run: `npm run dev` (not `npm run build && npm start`)

### Frontend can't reach backend API
- Check `VITE_API_URL` in correct `.env` file
- Development should be `http://localhost:3001`
- Production should be `https://your-domain.com`

### Build fails with "ENV variables not found"
- Ensure `.env.production` exists with required fields
- Or use `.env.example` as reference
- Check `npm run build` uses `dotenv -e .env.production`
