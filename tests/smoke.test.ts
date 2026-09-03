import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import { createTestUser } from './helpers.js';

describe('Test Infrastructure Smoke Test', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('provisions clean database and allows CRUD operations', async () => {
    const user = await createTestUser(db.prisma, {
      name: 'Smoke Admin',
      email: 'smoke@bytic.ir',
      role: 'ADMIN',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('smoke@bytic.ir');
    expect(user.role).toBe('ADMIN');

    const queried = await db.prisma.user.findUnique({
      where: { email: 'smoke@bytic.ir' },
    });

    expect(queried?.name).toBe('Smoke Admin');
  });
});
