import type { PrismaClient } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';
import type { CreateUserInput, UpdateUserInput } from '../_lib/validation.js';

const SALT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createUser(
  prisma: PrismaClient,
  data: CreateUserInput
): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      id: createId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role || 'TEACHER',
      updatedAt: new Date(),
    },
  });

  return toSafeUser(user);
}

export async function listUsers(prisma: PrismaClient): Promise<SafeUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return users.map(toSafeUser);
}

export async function getUserById(
  prisma: PrismaClient,
  id: string
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user ? toSafeUser(user) : null;
}

export async function updateUser(
  prisma: PrismaClient,
  id: string,
  data: UpdateUserInput
): Promise<SafeUser> {
  if (data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing && existing.id !== id) {
      throw new Error('A user with this email already exists');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.email ? { email: data.email.toLowerCase().trim() } : {}),
      ...(data.role ? { role: data.role } : {}),
      updatedAt: new Date(),
    },
  });

  return toSafeUser(user);
}

export interface ResetPasswordOptions {
  currentPassword?: string;
  invalidateSessions?: boolean;
}

export async function resetPassword(
  prisma: PrismaClient,
  id: string,
  newPassword: string,
  options?: ResetPasswordOptions
): Promise<{ success: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (options?.currentPassword !== undefined) {
    const isValid = await bcrypt.compare(options.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      updatedAt: new Date(),
    },
  });

  // Invalidate any active sessions if specified (defaults to true for administrative reset, false for self reset)
  if (options?.invalidateSessions ?? true) {
    await prisma.authSession.deleteMany({
      where: { userId: id },
    });
  }

  return { success: true };
}

export async function deleteUser(
  prisma: PrismaClient,
  id: string,
  currentUserId: string
): Promise<{ success: boolean }> {
  if (id === currentUserId) {
    throw new Error('You cannot delete your own account');
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
}
