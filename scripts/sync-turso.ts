import { execSync } from 'node:child_process';
import path from 'node:path';
import { createClient } from '@libsql/client';

// Load .env if available (in local environments)
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // Ignore missing .env in production
}

async function syncTurso() {
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    (process.env.DATABASE_URL?.startsWith('libsql:') ||
    process.env.DATABASE_URL?.startsWith('https:') ||
    process.env.DATABASE_URL?.startsWith('http:')
      ? process.env.DATABASE_URL
      : undefined);

  const authToken =
    process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

  if (!tursoUrl) {
    console.log('ℹ️  No TURSO_DATABASE_URL detected. Skipping Turso remote sync.');
    return;
  }

  // Mask token / credentials if present in URL
  const maskedUrl = tursoUrl.replace(/:[^@]+@/, ':***@');
  console.log(`📡 Connecting to remote Turso database at ${maskedUrl}...`);

  const client = createClient({
    url: tursoUrl,
    authToken,
  });

  try {
    console.log('⚙️  Generating schema DDL from Prisma schema...');
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const ddlRaw = execSync(
      `npx prisma migrate diff --from-empty --to-schema-datamodel "${schemaPath}" --script`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    // Make DDL idempotent so re-runs on existing databases succeed safely
    const idempotentDdl = ddlRaw
      .replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ')
      .replace(/CREATE UNIQUE INDEX /g, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
      .replace(/CREATE INDEX /g, 'CREATE INDEX IF NOT EXISTS ');

    console.log('🚀 Applying schema DDL to Turso database...');
    await client.executeMultiple(idempotentDdl);
    console.log('✅ Remote Turso schema synchronized successfully.');

    // Check if seeding is needed (empty user table)
    try {
      const userCountResult = await client.execute('SELECT COUNT(*) as count FROM "User"');
      const userCount = Number(userCountResult.rows[0]?.count ?? 0);

      if (userCount === 0) {
        console.log('🌱 No users found in database. Running initial seed...');
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
        console.log('✅ Initial database seed complete!');
      } else {
        console.log(`ℹ️  Database already initialized (${userCount} users found). Skipping seed.`);
      }
    } catch (seedErr) {
      console.warn('⚠️  Could not check user count for auto-seeding:', seedErr);
    }
  } finally {
    client.close();
  }
}

syncTurso().catch((err) => {
  console.error('❌ Turso sync failed:', err);
  process.exit(1);
});
