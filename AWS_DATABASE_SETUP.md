# AWS Database Setup Guide for DPS Meter

## Step 1: Set Up AWS RDS PostgreSQL

### Prerequisites
- AWS Account (create at aws.amazon.com if needed)
- ~5 minutes setup time

### Create RDS Instance

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com

2. **Navigate to RDS**
   - Search for "RDS" in the search bar
   - Click "Create database"

3. **Configure Database**
   ```
   Database Creation Method: Standard create
   Engine: PostgreSQL
   Version: 17.x (latest stable)
   Template: Free tier (if eligible)
   DB Instance Class: db.t4.micro
   Storage: 20 GB (auto-scaling enabled)
   ```

4. **Connectivity Settings**
   ```
   Publicly accessible: Yes (for development)
   VPC: Default VPC
   Subnet group: default (create new if needed)
   Public accessibility: Yes
   ```

5. **Authentication**
   - Master username: `dpsadmin`
   - Auto-generate password: YES (save it securely!)
   - Or use your own password

6. **Database Name**
   ```
   Initial database name: dpsmeter_db
   ```

7. **Backup**
   - Backup retention: 7 days (default)
   - Preferred backup window: Use default

8. **Create Database**
   - Click "Create database"
   - Wait 3-5 minutes for creation

### Get Connection Details

1. Go to RDS Dashboard
2. Click on your database
3. Copy these details:
   - **Endpoint** (host)
   - **Port** (default 5432)
   - **Master username**
   - **Master password** (from secrets manager or your notes)

---

## Step 2: Update Backend Code

### Install PostgreSQL Driver

```bash
npm install pg
npm install -D @types/pg
```

### Create Database Connection Module

Create `server/aws-db.ts`:

```typescript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'dpsadmin',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dpsmeter_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const close = async () => {
  await pool.end();
};

export default pool;
```

### Update Database Module

Replace `server/db.ts` with PostgreSQL version:

```typescript
import { query } from './aws-db.js';

export interface SharedLog {
  id: number;
  shareId: string;
  playerName: string;
  totalDamage: number;
  damagePerSecond: number;
  duration: number;
  timestamp: number;
  logData: string;
  createdAt: Date;
}

class Database {
  async init() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS shared_logs (
          id SERIAL PRIMARY KEY,
          shareId VARCHAR(8) UNIQUE NOT NULL,
          playerName VARCHAR(255) NOT NULL,
          totalDamage BIGINT NOT NULL,
          damagePerSecond DECIMAL(10, 2) NOT NULL,
          duration INTEGER NOT NULL,
          timestamp BIGINT NOT NULL,
          logData TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  }

  async saveLog(
    shareId: string,
    playerName: string,
    totalDamage: number,
    dps: number,
    duration: number,
    timestamp: number,
    logData: string
  ): Promise<SharedLog> {
    const result = await query(
      `INSERT INTO shared_logs (shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [shareId, playerName, totalDamage, dps, duration, timestamp, logData]
    );
    return result.rows[0];
  }

  async getLogByShareId(shareId: string): Promise<SharedLog | null> {
    const result = await query(
      'SELECT * FROM shared_logs WHERE shareId = $1',
      [shareId]
    );
    return result.rows[0] || null;
  }

  async getAllLogs(): Promise<SharedLog[]> {
    const result = await query(
      'SELECT * FROM shared_logs ORDER BY createdAt DESC LIMIT 100'
    );
    return result.rows;
  }
}

export default new Database();
```

---

## Step 3: Update Environment Configuration

Update `.env`:

```env
# AWS RDS PostgreSQL
DB_HOST=your-instance.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=dpsadmin
DB_PASSWORD=your_secure_password_here
DB_NAME=dpsmeter_db

# Frontend
VITE_API_URL=https://api.yourdomain.com
BASE_URL=https://yourdomain.com

# Server
PORT=3001
NODE_ENV=production
```

For local development, use a different `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=dpsadmin
DB_PASSWORD=localpassword
DB_NAME=dpsmeter_local

VITE_API_URL=http://localhost:3001
BASE_URL=http://localhost:5173

PORT=3001
NODE_ENV=development
```

---

## Step 4: Deploy to AWS

### Option A: AWS Elastic Beanstalk (Recommended for Beginners)

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   cd workspace
   eb init -p node.js-18 dps-meter-api
   ```

3. **Create Environment**
   ```bash
   eb create dps-meter-prod
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv \
     DB_HOST=your-rds-endpoint.rds.amazonaws.com \
     DB_PORT=5432 \
     DB_USER=dpsadmin \
     DB_PASSWORD=your_password \
     DB_NAME=dpsmeter_db \
     NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Option B: AWS Amplify (Easiest)

1. **Connect GitHub Repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repo
   - Select branch: `feat/share-dps`

2. **Configure Build Settings**
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - '**/*'
     - backend:
         phases:
           install:
             commands:
               - cd server && npm install
           build:
             commands:
               - cd server && npm run build
   ```

3. **Add Environment Variables**
   - Add all DB variables in Amplify Console

### Option C: EC2 + Docker (Most Control)

See Docker section below.

---

## Step 5: Security Configuration

### AWS Security Group

1. Go to RDS → Databases → Your DB
2. Click Security Group
3. Add Inbound Rule:
   ```
   Type: PostgreSQL
   Port: 5432
   Source: Your Elastic Beanstalk/Amplify security group
   ```

### Store Secrets Securely

**Never commit passwords to GitHub!**

Use AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name dps-meter/db \
  --secret-string '{
    "username":"dpsadmin",
    "password":"your_secure_password",
    "host":"your-instance.rds.amazonaws.com"
  }'
```

Retrieve in code:

```typescript
import AWS from 'aws-sdk';

const secretsClient = new AWS.SecretsManager();

export const getDbConfig = async () => {
  const secret = await secretsClient.getSecretValue({
    SecretId: 'dps-meter/db'
  }).promise();
  
  return JSON.parse(secret.SecretString);
};
```

---

## Step 6: Local Development with RDS

### Connect to AWS RDS from Local Machine

1. **Get RDS Endpoint and Port**
   ```bash
   aws rds describe-db-instances --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port]'
   ```

2. **Update `.env.local`**
   ```env
   DB_HOST=your-instance.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
   DB_PORT=5432
   DB_USER=dpsadmin
   DB_PASSWORD=your_password
   DB_NAME=dpsmeter_db
   NODE_ENV=development
   ```

3. **Allow Your IP in Security Group**
   - Go to RDS Security Group
   - Add inbound rule:
     ```
     Type: PostgreSQL
     Port: 5432
     Source: YOUR_IP_ADDRESS/32
     ```
   - Get your IP: `curl ifconfig.me`

4. **Test Connection**
   ```bash
   npm run dev:server
   ```

---

## Cost Estimates

### RDS PostgreSQL (Free Tier Eligible)
- **Free Tier:** 750 hours/month × 12 months
- **With t3.micro:** $0/month (first year)
- **After free tier:** ~$15-20/month

### Data Transfer
- **Outbound:** $0.02/GB
- **Typical usage:** <5GB/month = ~$0 (negligible)

### Backups
- **Storage:** Included in free tier
- **Retention:** 7 days (default)

---

## Migration from SQLite to RDS

### Export Data from SQLite

```bash
# Dump SQLite database
sqlite3 server/dps_shares.db .dump > export.sql

# Clean SQL (optional)
# Edit export.sql to remove SQLite-specific commands
```

### Import to PostgreSQL

```bash
# Install pgloader (easier)
# On macOS: brew install pgloader
# On Linux: sudo apt install pgloader

# Convert and import
pgloader sqlite:///path/to/dps_shares.db postgresql://user:password@host/dbname
```

Or manually:

```sql
-- Connect to PostgreSQL and run similar CREATE TABLE/INSERT statements
CREATE TABLE shared_logs (
  id SERIAL PRIMARY KEY,
  shareId VARCHAR(8) UNIQUE NOT NULL,
  playerName VARCHAR(255) NOT NULL,
  totalDamage BIGINT NOT NULL,
  damagePerSecond DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  logData TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data from exports...
```

---

## Deployment Checklist

- [ ] RDS PostgreSQL instance created
- [ ] Security group configured
- [ ] Database connection tested
- [ ] Environment variables set
- [ ] Backend updated with PostgreSQL driver
- [ ] `aws-db.ts` created
- [ ] `db.ts` updated for PostgreSQL
- [ ] Dependencies installed (`pg`, `@types/pg`)
- [ ] Build successful: `npm run build && npm run build:server`
- [ ] Local testing with RDS complete
- [ ] Deployment platform chosen (Beanstalk/Amplify/EC2)
- [ ] Secrets stored securely
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled for production
- [ ] Monitoring configured (CloudWatch)

---

## Troubleshooting

### "Cannot connect to database"
- Check security group rules
- Verify DB endpoint and port
- Ensure credentials are correct
- Check network connectivity

### "SSL certificate problem"
```typescript
// In aws-db.ts
ssl: process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }  // RDS uses self-signed cert
  : false
```

### "Too many connections"
- Reduce connection pool size
- Check for connection leaks
- Increase RDS max connections

### "Database error: column doesn't exist"
- Check data types match PostgreSQL
- Run migrations if schema changed
- Verify SQL syntax

---

## Production Best Practices

1. **Enable Enhanced Monitoring**
   - RDS Console → Modify → Enable Enhanced Monitoring

2. **Set Up Automated Backups**
   - Backup retention: 30+ days
   - Multi-AZ deployment for HA

3. **Use Connection Pooling**
   - PgBouncer or built-in pool

4. **Monitor Performance**
   - CloudWatch metrics
   - Slow query logs

5. **Enable Encryption**
   - Encryption at rest (enabled by default)
   - Encryption in transit (SSL/TLS)

6. **Regular Testing**
   - Test failover scenarios
   - Test recovery from backups
   - Load testing before launch

---

## Next Steps

1. Create RDS PostgreSQL instance (5 minutes)
2. Update backend code with PostgreSQL support
3. Test connection locally
4. Deploy to AWS (Elastic Beanstalk/Amplify)
5. Monitor and optimize

---

**Questions?** Check AWS RDS documentation: https://docs.aws.amazon.com/rds/
