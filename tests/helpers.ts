import type { PrismaClient } from '../api/_lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { createId } from '@paralleldrive/cuid2';

const SALT_ROUNDS = 4; // Low for test speed

/**
 * Create a test user with hashed password.
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'ADMIN' | 'TEACHER';
  } = {}
) {
  const password = overrides.password ?? 'testpass123';
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      id: createId(),
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `test-${createId()}@test.com`,
      passwordHash,
      role: overrides.role ?? 'TEACHER',
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test course.
 */
export async function createTestCourse(
  prisma: PrismaClient,
  overrides: { name?: string } = {}
) {
  return prisma.course.create({
    data: {
      id: createId(),
      name: overrides.name ?? 'Test Course',
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test class linked to a course.
 */
export async function createTestClass(
  prisma: PrismaClient,
  overrides: { name?: string; courseId?: string } = {}
) {
  let courseId = overrides.courseId;
  if (!courseId) {
    const course = await createTestCourse(prisma);
    courseId = course.id;
  }

  return prisma.class.create({
    data: {
      id: createId(),
      name: overrides.name ?? 'Test Class',
      courseId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test student.
 */
export async function createTestStudent(
  prisma: PrismaClient,
  overrides: {
    name?: string;
    birthdate?: string;
    gender?: 'MALE' | 'FEMALE';
    about?: string;
  } = {}
) {
  return prisma.student.create({
    data: {
      id: createId(),
      name: overrides.name ?? 'Test Student',
      birthdate: overrides.birthdate,
      gender: overrides.gender,
      about: overrides.about,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test session for a class.
 */
export async function createTestSession(
  prisma: PrismaClient,
  overrides: {
    classId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } = {}
) {
  let classId = overrides.classId;
  if (!classId) {
    const cls = await createTestClass(prisma);
    classId = cls.id;
  }

  return prisma.session.create({
    data: {
      id: createId(),
      classId,
      date: overrides.date ?? '2026-09-15',
      startTime: overrides.startTime ?? '10:00',
      endTime: overrides.endTime ?? '11:30',
      updatedAt: new Date(),
    },
  });
}

/**
 * Assign a teacher to a class.
 */
export async function assignTeacherToClass(
  prisma: PrismaClient,
  classId: string,
  userId: string
) {
  return prisma.classTeacher.create({
    data: {
      id: createId(),
      classId,
      userId,
    },
  });
}

/**
 * Enroll a student in a class.
 */
export async function enrollStudentInClass(
  prisma: PrismaClient,
  classId: string,
  studentId: string
) {
  return prisma.classStudent.create({
    data: {
      id: createId(),
      classId,
      studentId,
    },
  });
}

/**
 * Create a valid auth session for a user.
 */
export async function createTestAuthSession(
  prisma: PrismaClient,
  userId: string,
  overrides: { expiresAt?: Date } = {}
) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = overrides.expiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return prisma.authSession.create({
    data: {
      id: createId(),
      token,
      userId,
      expiresAt,
    },
  });
}
