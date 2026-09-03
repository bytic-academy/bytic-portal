import type { PrismaClient } from '../_lib/prisma.js';
import { createId } from '@paralleldrive/cuid2';
import type {
  CreateSessionInput,
  BulkCreateSessionInput,
  UpdateSessionInput,
} from '../_lib/validation.js';

async function verifyClassAccess(
  prisma: PrismaClient,
  classId: string,
  userId: string,
  role: string
) {
  if (role === 'ADMIN') return true;

  const assignment = await prisma.classTeacher.findUnique({
    where: {
      classId_userId: { classId, userId },
    },
  });

  if (!assignment) {
    throw new Error('Access denied: You are not assigned to this class');
  }

  return true;
}

export async function createSession(
  prisma: PrismaClient,
  data: CreateSessionInput,
  userId: string,
  role: string
) {
  await verifyClassAccess(prisma, data.classId, userId, role);

  return prisma.session.create({
    data: {
      id: createId(),
      classId: data.classId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      updatedAt: new Date(),
    },
    include: {
      class: {
        include: { course: true },
      },
    },
  });
}

export async function bulkCreateSessions(
  prisma: PrismaClient,
  data: BulkCreateSessionInput,
  userId: string,
  role: string
) {
  await verifyClassAccess(prisma, data.classId, userId, role);

  if (!data.dates || data.dates.length === 0) {
    throw new Error('At least one date is required for bulk session creation');
  }

  const createdSessions = await prisma.$transaction(async (tx) => {
    const sessions = [];
    for (const date of data.dates) {
      const session = await tx.session.create({
        data: {
          id: createId(),
          classId: data.classId,
          date,
          startTime: data.startTime,
          endTime: data.endTime,
          updatedAt: new Date(),
        },
      });
      sessions.push(session);
    }
    return sessions;
  });

  return createdSessions;
}

export async function listSessionsByClass(
  prisma: PrismaClient,
  classId: string,
  userId: string,
  role: string
) {
  await verifyClassAccess(prisma, classId, userId, role);

  return prisma.session.findMany({
    where: { classId },
    include: {
      _count: {
        select: { attendance: true },
      },
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });
}

export async function getSessionById(
  prisma: PrismaClient,
  id: string,
  userId: string,
  role: string
) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          course: true,
          students: {
            include: { student: true },
            orderBy: { student: { name: 'asc' } },
          },
          teachers: {
            include: { user: true },
          },
        },
      },
      attendance: {
        include: { student: true },
      },
    },
  });

  if (!session) return null;

  await verifyClassAccess(prisma, session.classId, userId, role);

  return session;
}

export async function updateSession(
  prisma: PrismaClient,
  id: string,
  data: UpdateSessionInput,
  userId: string,
  role: string
) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    throw new Error('Session not found');
  }

  await verifyClassAccess(prisma, session.classId, userId, role);

  return prisma.session.update({
    where: { id },
    data: {
      ...(data.date ? { date: data.date } : {}),
      ...(data.startTime ? { startTime: data.startTime } : {}),
      ...(data.endTime ? { endTime: data.endTime } : {}),
      updatedAt: new Date(),
    },
  });
}

export async function deleteSession(
  prisma: PrismaClient,
  id: string,
  userId: string,
  role: string
) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    throw new Error('Session not found');
  }

  await verifyClassAccess(prisma, session.classId, userId, role);

  await prisma.session.delete({
    where: { id },
  });

  return { success: true };
}
