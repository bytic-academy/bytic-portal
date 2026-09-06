# Bytic Attendance System

> Modern, high-performance student attendance and roster management system built for **Bytic Educational Group** ([bytic.ir](https://bytic.ir)).

---

## 🌟 Overview & Tech Stack

Bytic Attendance System is a production-grade web application with a unified architecture supporting local development, containerized self-hosting with persistent SQLite on any VPS, and serverless cloud deployment on Vercel with Turso.

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, Radix UI.
- **Internationalization**: Paraglide JS (`@inlang/paraglide-js`) with compile-time type-safety (Persian RTL & English LTR).
- **Backend / API**: Type-safe REST handlers with Zod validation, running on Node.js and Vercel Serverless.
- **Database & ORM**: Prisma ORM with `@prisma/adapter-libsql` and `@libsql/client`.
- **Deployment**: Docker & Docker Compose (multi-stage Alpine image, non-root `node` user, persistent volumes) + Vercel.

---

## 🚀 Quick Navigation

1. [Local Development (Node.js & Vite)](#-local-development-nodejs--vite)
2. [Local Testing with Docker Compose](#-local-testing-with-docker-compose)
3. [Production Self-Hosting on a VPS](#-production-self-hosting-on-a-vps)
4. [Cloud Deployment: Vercel + Turso](#-cloud-deployment-vercel--turso)
5. [Database Management & Backups](#-database-management--backups)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Available Scripts](#-available-scripts)

---

## 💻 Local Development (Node.js & Vite)

### Prerequisites
- **Node.js**: v22.0.0 or higher
- **pnpm**: v9.0.0 or higher (or `corepack enable`)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` configuration for local development uses embedded SQLite:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=development
```

### Step 3: Compile Translations (Paraglide i18n)
```bash
pnpm run compile:i18n
```

### Step 4: Initialize & Seed SQLite Database
```bash
# Push Prisma schema to local SQLite database
pnpm run db:push

# (Optional) Seed sample students and attendance data
pnpm run db:seed
```

### Step 5: Start Local Development Server
```bash
pnpm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. API requests to `/api/*` are handled live via Vite's SSR middleware.

---

## 🐳 Local Testing with Docker Compose

Test the production container build locally before deploying to your VPS:

### Step 1: Build & Start Containers
```bash
docker compose up -d --build
```

### Step 2: Verify Container Health
```bash
# Check running container status and health check
docker compose ps

# Test the healthcheck endpoint
curl http://localhost:3000/health
```

### Step 3: Seed Test Database in Container (Optional)
```bash
docker compose exec app pnpm run db:seed
```

Access the application in your browser at [http://localhost:3000](http://localhost:3000).

### Step 4: Stop Containers
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers AND delete persistent database volume (resets data)
docker compose down -v
```

---

## 🌐 Production Self-Hosting on a VPS

The included `Dockerfile` and `docker-compose.yml` are production-hardened:
- **Multi-Stage Build**: Keeps the runtime image lightweight (< 80MB).
- **Least Privilege Security**: Container runs as non-root `node` user (UID 1000).
- **Automated Schema Sync**: Automatically runs `prisma db push --skip-generate` on container startup via `docker-entrypoint.sh`.
- **Persistent Data Volume**: SQLite database is stored on Docker named volume `attendance_data` at `/data/attendance.db`.

### VPS Deployment Steps

1. **Install Docker & Docker Compose** on your Linux VPS (Ubuntu/Debian):
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/bytic-attendance.git /opt/bytic-attendance
   cd /opt/bytic-attendance
   ```

3. **Configure Production Environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   PORT=3000
   NODE_ENV=production
   DATABASE_URL="file:/data/attendance.db"
   AUTO_SEED=false
   ```

4. **Launch Application Stack**:
   ```bash
   docker compose up -d --build
   ```

5. **Seed Initial Data (Optional)**:
   ```bash
   docker compose exec app pnpm run db:seed
   ```

---

### Reverse Proxy & SSL Setup

For production, put a reverse proxy in front of Docker for automatic SSL (HTTPS).

#### Option A: Caddy (Recommended - Auto HTTPS)
Create `/etc/caddy/Caddyfile`:
```caddy
attendance.yourdomain.com {
    reverse_proxy localhost:3000
}
```
Reload Caddy:
```bash
sudo systemctl reload caddy
```

#### Option B: Nginx + Certbot
Create `/etc/nginx/sites-available/bytic-attendance`:
```nginx
server {
    server_name attendance.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and obtain SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/bytic-attendance /etc/nginx/sites-enabled/
sudo certbot --nginx -d attendance.yourdomain.com
```

---

## ☁️ Cloud Deployment: Vercel + Turso (Automated "Push to Deploy")

For serverless cloud deployment, the application is preconfigured for **Vercel** (hosting the static SPA & catch-all serverless API) and **Turso** (distributed libSQL database).

Database schema migrations and seed data are **automatically synchronized** during every Vercel build via `scripts/sync-turso.ts`.

### Option A: Zero-Configuration via Vercel Marketplace (Recommended)

1. **Import Git Repository**:
   - Go to [Vercel Dashboard](https://vercel.com) and import `bytic-academy/bytic-portal`.
   - Vercel automatically detects the Vite framework and uses `pnpm install` / `pnpm run build`.

2. **Connect Turso Database (1-Click)**:
   - In your Vercel Project, navigate to **Integrations** -> Search for **Turso**.
   - Click **Add Integration** and connect your GitHub or Turso account.
   - Turso automatically creates a database and sets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your project's environment variables.

3. **Deploy**:
   - Trigger the deployment. The Vercel build automatically runs `scripts/sync-turso.ts` to push the schema DDL to Turso, seeds the initial administrator account (`admin@bytic.ir`), builds frontend assets, and deploys live.

---

### Option B: Direct Turso Setup

1. **Create Turso Database**:
   - Sign up or log in at [turso.tech](https://turso.tech) (or via `turso` CLI).
   - Create a database:
     ```bash
     turso db create bytic-attendance
     ```
   - Retrieve your connection URL and create an auth token:
     ```bash
     turso db show bytic-attendance --url
     # Example: libsql://bytic-attendance-[org].turso.io

     turso db tokens create bytic-attendance
     ```

2. **Configure Environment Variables in Vercel**:
   - In Vercel Project Settings -> **Environment Variables**, add:
     - `TURSO_DATABASE_URL`: `libsql://bytic-attendance-[org].turso.io`
     - `TURSO_AUTH_TOKEN`: `your-turso-auth-token`

3. **Deploy & Ongoing Git-Ops**:
   - Push to your GitHub `main` branch.
   - Vercel automatically runs `pnpm run build`, which:
     1. Compiles translations (`paraglide-js`).
     2. Runs `scripts/sync-turso.ts` (applies Prisma schema DDL diffs to Turso & seeds admin if empty).
     3. Typechecks and builds static assets (`vite build`).
     4. Deploys the unified serverless API (`api/index.ts`) and global edge CDN.

4. **Manual Remote Schema Sync (Optional)**:
   You can also sync your schema to Turso directly from your local machine anytime:
   ```bash
   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." pnpm run db:sync:turso
   ```

---

## 🗄️ Database Management & Backups

### 1. Inspecting / Modifying SQLite Data Directly
You can run the interactive SQLite shell inside the container:
```bash
docker compose exec app sqlite3 /data/attendance.db
```
Or open the database file on the host VPS using any SQLite GUI (DBeaver, TablePlus, VSCode SQLite extension):
```bash
# Host file location:
/var/lib/docker/volumes/attendance_data/_data/attendance.db
```

### 2. Hot Atomic Backups (Safe while running)
SQLite provides an atomic `.backup` command that produces a clean snapshot even under active writes:
```bash
docker compose exec app sqlite3 /data/attendance.db \
  ".backup /data/attendance-backup-$(date +%F_%H-%M).db"
```

### 3. Automated Daily Backup Cron Job
Add a daily cron job on the VPS (`crontab -e`):
```bash
0 3 * * * docker exec bytic-attendance sqlite3 /data/attendance.db ".backup /data/backup-daily.db" && cp /var/lib/docker/volumes/attendance_data/_data/backup-daily.db /backups/attendance-$(date +\%F).db
```

### 4. Database Restore
To restore from a backup:
```bash
# 1. Stop the container
docker compose stop

# 2. Copy the backup file over the active DB
cp /path/to/backup.db /var/lib/docker/volumes/attendance_data/_data/attendance.db

# 3. Start the container
docker compose start
```

---

## ⚙️ Environment Variables Reference

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | `file:./prisma/dev.db` | Path or URI for SQLite database (e.g. `file:/data/attendance.db`). |
| `TURSO_DATABASE_URL` | String | _(Optional)_ | Remote Turso libSQL URL (e.g. `libsql://db-user.turso.io`). |
| `TURSO_AUTH_TOKEN` | String | _(Optional)_ | Authentication token for Turso cloud database. |
| `PORT` | Number | `3000` | Port for the standalone Node.js production server. |
| `NODE_ENV` | String | `production` | Runtime environment (`development` / `production`). |
| `AUTO_SEED` | Boolean | `false` | If `true`, runs `prisma/seed.ts` automatically on container launch. |

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `pnpm run dev` | `vite` | Starts local development server with live API SSR. |
| `pnpm run build` | `prisma generate && tsc -b && vite build` | Builds TypeScript, generates Prisma client, and bundles Vite SPA. |
| `pnpm run start` | `tsx server/index.ts` | Starts standalone Node.js production server. |
| `pnpm run compile:i18n` | `paraglide-js compile ...` | Compiles Paraglide translation dictionaries into `./src/paraglide`. |
| `pnpm run db:push` | `prisma db push` | Pushes Prisma schema changes directly to the configured database. |
| `pnpm run db:seed` | `tsx prisma/seed.ts` | Seeds database with sample courses and student records. |
| `pnpm run preview` | `vite preview` | Previews static built client bundle. |

---

## 🔒 Security & Best Practices

- **Non-root Container**: Production Dockerfile switches to `USER node` before running server code.
- **Security Headers**: Production server automatically sets `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
- **Healthchecks**: Built-in container health monitor checks `GET /health` every 30s.
- **Graceful Shutdown**: Intercepts `SIGINT`/`SIGTERM` to safely disconnect Prisma and close HTTP streams.

---

## 📄 License
Internal project for [Bytic Educational Group](https://bytic.ir). All rights reserved.
