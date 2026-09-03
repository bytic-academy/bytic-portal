import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import { createTestUser } from './helpers.js';
import {
  login,
  validateSession,
  logout,
  getCurrentUser,
} from '../api/auth/service.js';

describe('Auth Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('successful login with valid credentials creates 90-day session', async () => {
    const user = await createTestUser(db.prisma, {
      email: 'teacher1@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
      name: 'Teacher One',
    });

    const result = await login(db.prisma, 'teacher1@bytic.ir', 'password123');
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe(user.id);
    expect(result.user?.email).toBe('teacher1@bytic.ir');
    expect(result.user?.role).toBe('TEACHER');

    // Verify session in DB
    const session = await db.prisma.authSession.findUnique({
      where: { token: result.token },
    });
    expect(session).toBeDefined();
    expect(session?.userId).toBe(user.id);
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000 - 60000;
    expect(session!.expiresAt.getTime() - Date.now()).toBeGreaterThan(ninetyDaysMs);
  });

  it('login with incorrect password fails with generic error', async () => {
    await createTestUser(db.prisma, {
      email: 'teacher2@bytic.ir',
      password: 'correct-password',
    });

    const result = await login(db.prisma, 'teacher2@bytic.ir', 'wrong-password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
    expect(result.token).toBeUndefined();
  });

  it('login with non-existent email fails with generic error', async () => {
    const result = await login(db.prisma, 'nonexistent@bytic.ir', 'some-password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });

  it('validateSession returns user for active session', async () => {
    const user = await createTestUser(db.prisma, {
      email: 'admin-auth@bytic.ir',
      password: 'password123',
      role: 'ADMIN',
    });

    const loginRes = await login(db.prisma, 'admin-auth@bytic.ir', 'password123');
    const validated = await validateSession(db.prisma, loginRes.token!);

    expect(validated).toBeDefined();
    expect(validated?.id).toBe(user.id);
    expect(validated?.role).toBe('ADMIN');
  });

  it('validateSession returns null for expired session', async () => {
    const user = await createTestUser(db.prisma, {
      email: 'expired-user@bytic.ir',
    });

    const expiredToken = 'expired-token-' + Date.now();
    await db.prisma.authSession.create({
      data: {
        id: 'expired-sess-' + Date.now(),
        token: expiredToken,
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      },
    });

    const validated = await validateSession(db.prisma, expiredToken);
    expect(validated).toBeNull();
  });

  it('validateSession returns null for non-existent token', async () => {
    const validated = await validateSession(db.prisma, 'invalid-non-existent-token');
    expect(validated).toBeNull();
  });

  it('logout invalidates and deletes the session in DB', async () => {
    await createTestUser(db.prisma, {
      email: 'logout-user@bytic.ir',
      password: 'password123',
    });

    const loginRes = await login(db.prisma, 'logout-user@bytic.ir', 'password123');
    const token = loginRes.token!;

    const logoutResult = await logout(db.prisma, token);
    expect(logoutResult.success).toBe(true);

    // Verify session is deleted
    const session = await db.prisma.authSession.findUnique({
      where: { token },
    });
    expect(session).toBeNull();

    // Verify subsequent validation fails
    const validated = await validateSession(db.prisma, token);
    expect(validated).toBeNull();
  });

  it('getCurrentUser returns user profile without password hash', async () => {
    const user = await createTestUser(db.prisma, {
      name: 'Safe User',
      email: 'safe@bytic.ir',
      password: 'secretpassword',
      role: 'TEACHER',
    });

    const loginRes = await login(db.prisma, 'safe@bytic.ir', 'secretpassword');
    const profile = await getCurrentUser(db.prisma, loginRes.token!);

    expect(profile).toBeDefined();
    expect(profile?.name).toBe('Safe User');
    expect(profile?.email).toBe('safe@bytic.ir');
    expect(profile?.role).toBe('TEACHER');
    expect((profile as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
  });
});
