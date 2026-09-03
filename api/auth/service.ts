import type { PrismaClient } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { createId } from '@paralleldrive/cuid2';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthSessionUser;
  error?: string;
}

const SESSION_DURATION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

/**
 * Authenticate user with email and password, creating a 90-day session if valid.
 */
export async function login(
  prisma: PrismaClient,
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Generate cryptographically secure 64-character hex session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.authSession.create({
    data: {
      id: createId(),
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Validate a session token against the database and expiration time.
 */
export async function validateSession(
  prisma: PrismaClient,
  token: string
): Promise<AuthSessionUser | null> {
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Delete expired session asynchronously
    prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

/**
 * Invalidate and delete a session token from the database.
 */
export async function logout(
  prisma: PrismaClient,
  token: string
): Promise<{ success: boolean }> {
  try {
    await prisma.authSession.delete({
      where: { token },
    });
  } catch {
    // Session might already be removed
  }

  return { success: true };
}

/**
 * Retrieve current user profile by session token.
 */
export async function getCurrentUser(
  prisma: PrismaClient,
  token: string
): Promise<AuthSessionUser | null> {
  return validateSession(prisma, token);
}
