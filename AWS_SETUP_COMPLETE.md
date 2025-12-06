# AWS Database Setup - Complete

## ✅ Completed Steps

### 1. Database Abstraction Layer Created
- **`server/db-abstract.ts`** - Automatically detects SQLite vs PostgreSQL based on environment
- **`server/db-sqlite.ts`** - SQLite operations (used in development by default)
- **`server/db-postgres.ts`** - PostgreSQL operations (used when AWS RDS is configured)
- **`server/aws-db.ts`** - PostgreSQL connection pool with SSL support

### 2. Backend Updated
- `server/index.ts` now imports from `db-abstract.js`
- Calls `db.initialize()` at startup to set up the database
- Both SQLite and PostgreSQL modules implement the same interface

### 3. TypeScript Compilation Complete
- All `.ts` files compiled to `.js`
- Type definitions installed for `pg`, `cors`, and `node`
- tsconfig.json configured for ES2022 with top-level await support

### 4. Local Development Verified
```
npm run dev
```
✅ Frontend running: http://localhost:5173
✅ Backend running: http://localhost:3001 (using SQLite)

## 🚀 Next: AWS PostgreSQL Setup (Optional but Recommended for Production)

### Step 1: Create AWS RDS PostgreSQL Instance
1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Select **PostgreSQL** (version 15 or later recommended)
4. Database identifier: `dpsmeter-db`
5. Master username: `dpsadmin`
6. Master password: `<choose a strong password>`
7. DB instance size: `db.t3.micro` (free tier eligible)
8. **Important**: In "Connectivity" section, select "Publicly accessible: Yes"
9. Create database (takes 3-5 minutes)

### Step 2: Update .env File
After RDS instance is created and available, update `.env`:

```env
# AWS PostgreSQL Configuration
DB_HOST=your-instance-id.xxxxxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=dpsadmin
DB_PASSWORD=your_secure_password
DB_NAME=dpsmeter_db
NODE_ENV=production
```

### Step 3: Test the Connection
```bash
npm run dev
```

You should see:
```
[1] Using PostgreSQL (AWS RDS)...
[1] DPS Meter API server running on http://localhost:3001
[1] Connected to PostgreSQL (AWS RDS)
[1] PostgreSQL Database initialized
```

### Step 4: Create Database Rules (Security Group)
In AWS Console, go to RDS → your instance → Modify:
- Under "Security group rules", allow inbound traffic on port 5432 from your IP
- Or use AWS Secrets Manager for better security

## 📝 How It Works

The abstraction layer automatically selects the database:

```javascript
// If these environment variables are set:
// DB_HOST, DB_USER, DB_PASSWORD
// → Uses PostgreSQL (AWS RDS)

// Otherwise:
// → Uses SQLite (local file)
```

**In development**: Uses `dps_shares.db` (SQLite)
**In production**: Uses AWS RDS PostgreSQL

## 🔄 Switching Databases

To switch between SQLite and PostgreSQL, just update your `.env` file:

**Local SQLite Development** (current):
```env
# Leave DB_HOST, DB_USER, DB_PASSWORD unset
VITE_API_URL=http://localhost:3001
BASE_URL=http://localhost:5173
PORT=3001
```

**AWS PostgreSQL Production**:
```env
DB_HOST=your-rds-instance.xxxxx.rds.amazonaws.com
DB_USER=dpsadmin
DB_PASSWORD=your_password
DB_PORT=5432
DB_NAME=dpsmeter_db
VITE_API_URL=https://your-domain.com/api
BASE_URL=https://your-domain.com
PORT=3001
```

## 🐛 Troubleshooting

### "Failed to connect to PostgreSQL"
- Check `.env` variables are correct
- Verify RDS instance is running (Status: "Available" in AWS Console)
- Check security group allows traffic from your IP on port 5432

### "Using SQLite instead of PostgreSQL"
- If you want PostgreSQL, all three env vars must be set: `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Run `npm run dev` again after updating `.env`

### "SQLite database locked"
- This is normal in development if multiple processes access it
- For production, use PostgreSQL (AWS RDS) instead

## ✨ Benefits of PostgreSQL on AWS RDS

✅ Scalable to production traffic
✅ Automatic backups and recovery
✅ SSL/TLS encryption support
✅ Multi-AZ high availability option
✅ Easy to deploy alongside frontend

## 📊 Next: Deploy to AWS (Optional)

Once PostgreSQL is working locally:

1. **Option A**: Deploy to AWS Elastic Beanstalk
   - Use `eb init`, `eb create`, `eb deploy`
   - Automatically scales with traffic

2. **Option B**: Deploy to AWS Amplify Hosting
   - Git-based deployment (push to deploy)
   - Built-in CI/CD

3. **Option C**: Manual EC2 deployment
   - Full control over environment
   - Most complex setup

See `AWS_DATABASE_SETUP.md` for detailed deployment instructions.

---

**Current Status**: ✅ Local development working with SQLite, PostgreSQL integration ready for AWS deployment
