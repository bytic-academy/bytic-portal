import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import { createTestUser } from './helpers.js';
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser,
} from '../api/users/service.js';

describe('Users Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('admin creates a new teacher user successfully', async () => {
    const user = await createUser(db.prisma, {
      name: 'Ali Rezaei',
      email: 'ali@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Ali Rezaei');
    expect(user.email).toBe('ali@bytic.ir');
    expect(user.role).toBe('TEACHER');
    expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();

    // Verify stored password hash in DB
    const dbRecord = await db.prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(dbRecord?.passwordHash).toBeDefined();
    expect(dbRecord?.passwordHash).not.toBe('password123');
  });

  it('creating user with duplicate email throws error', async () => {
    await createUser(db.prisma, {
      name: 'Duplicate Test',
      email: 'dup@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
    });

    await expect(
      createUser(db.prisma, {
        name: 'Duplicate Test 2',
        email: 'dup@bytic.ir',
        password: 'password123',
        role: 'TEACHER',
      })
    ).rejects.toThrow(/already exists/i);
  });

  it('listUsers returns all users without password hashes', async () => {
    const users = await listUsers(db.prisma);
    expect(users.length).toBeGreaterThan(0);
    users.forEach((u) => {
      expect(u.id).toBeDefined();
      expect(u.name).toBeDefined();
      expect(u.email).toBeDefined();
      expect(u.role).toBeDefined();
      expect((u as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  it('getUserById returns user profile', async () => {
    const created = await createUser(db.prisma, {
      name: 'Single User',
      email: 'single@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
    });

    const user = await getUserById(db.prisma, created.id);
    expect(user).toBeDefined();
    expect(user?.name).toBe('Single User');
    expect(user?.email).toBe('single@bytic.ir');
  });

  it('updateUser modifies name, email, and role', async () => {
    const created = await createUser(db.prisma, {
      name: 'Before Update',
      email: 'before@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
    });

    const updated = await updateUser(db.prisma, created.id, {
      name: 'After Update',
      role: 'ADMIN',
    });

    expect(updated.name).toBe('After Update');
    expect(updated.role).toBe('ADMIN');
  });

  it('resetPassword updates password hash', async () => {
    const created = await createUser(db.prisma, {
      name: 'Reset Pwd User',
      email: 'reset@bytic.ir',
      password: 'oldpassword123',
      role: 'TEACHER',
    });

    const before = await db.prisma.user.findUnique({ where: { id: created.id } });
    await resetPassword(db.prisma, created.id, 'newpassword456');
    const after = await db.prisma.user.findUnique({ where: { id: created.id } });

    expect(before?.passwordHash).not.toBe(after?.passwordHash);
  });

  it('self-service resetPassword verifies currentPassword and preserves sessions', async () => {
    const created = await createUser(db.prisma, {
      name: 'Self Reset User',
      email: 'selfreset@bytic.ir',
      password: 'MyPassword123',
      role: 'TEACHER',
    });

    // Create an active session for the user
    const session = await db.prisma.authSession.create({
      data: {
        id: 'session-preserve-test',
        token: 'token-preserve-test',
        userId: created.id,
        expiresAt: new Date(Date.now() + 100000),
      },
    });

    // Reject wrong current password
    await expect(
      resetPassword(db.prisma, created.id, 'NewPassword456', {
        currentPassword: 'WrongPassword999',
        invalidateSessions: false,
      })
    ).rejects.toThrow(/current password is incorrect/i);

    // Accept correct current password and preserve session
    const res = await resetPassword(db.prisma, created.id, 'NewPassword456', {
      currentPassword: 'MyPassword123',
      invalidateSessions: false,
    });
    expect(res.success).toBe(true);

    const activeSession = await db.prisma.authSession.findUnique({
      where: { id: session.id },
    });
    expect(activeSession).not.toBeNull();
  });

  it('administrative resetPassword invalidates user sessions without requiring currentPassword', async () => {
    const created = await createUser(db.prisma, {
      name: 'Admin Reset Target',
      email: 'adminreset@bytic.ir',
      password: 'OldPassword123',
      role: 'TEACHER',
    });

    // Create an active session
    const session = await db.prisma.authSession.create({
      data: {
        id: 'session-invalidate-test',
        token: 'token-invalidate-test',
        userId: created.id,
        expiresAt: new Date(Date.now() + 100000),
      },
    });

    const res = await resetPassword(db.prisma, created.id, 'NewAdminPassword456', {
      invalidateSessions: true,
    });
    expect(res.success).toBe(true);

    const activeSession = await db.prisma.authSession.findUnique({
      where: { id: session.id },
    });
    expect(activeSession).toBeNull();
  });

  it('deleteUser removes user and prevents deleting own account', async () => {
    const created = await createUser(db.prisma, {
      name: 'To Delete',
      email: 'delete-me@bytic.ir',
      password: 'password123',
      role: 'TEACHER',
    });

    // Attempting self-deletion fails
    await expect(deleteUser(db.prisma, created.id, created.id)).rejects.toThrow(
      /cannot delete your own account/i
    );

    // Deleting by another user succeeds
    const admin = await createTestUser(db.prisma, { role: 'ADMIN' });
    const result = await deleteUser(db.prisma, created.id, admin.id);
    expect(result.success).toBe(true);

    const check = await db.prisma.user.findUnique({ where: { id: created.id } });
    expect(check).toBeNull();
  });
});
