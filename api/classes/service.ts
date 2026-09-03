import type { PrismaClient } from '../_lib/prisma.js';
import { createId } from '@paralleldrive/cuid2';
import type { CreateClassInput, UpdateClassInput } from '../_lib/validation.js';

export async function createClass(
  prisma: PrismaClient,
  data: CreateClassInput
) {
  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
  });

  if (!course) {
    throw new Error('Associated course does not exist');
  }

  return prisma.class.create({
    data: {
      id: createId(),
      name: data.name ? data.name.trim() : '',
      courseId: data.courseId,
      updatedAt: new Date(),
    },
    include: {
      course: true,
    },
  });
}

export async function listClasses(
  prisma: PrismaClient,
  userId: string,
  role: string
) {
  const where =
    role === 'ADMIN'
      ? {}
      : {
          teachers: {
            some: {
              userId,
            },
          },
        };

  return prisma.class.findMany({
    where,
    include: {
      course: true,
      teachers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      _count: {
        select: {
          students: true,
          sessions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getClassById(
  prisma: PrismaClient,
  id: string,
  userId?: string,
  role?: string
) {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      course: true,
      teachers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      students: {
        include: {
          student: true,
        },
        orderBy: {
          student: {
            name: 'asc',
          },
        },
      },
      sessions: {
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
      },
    },
  });

  if (!cls) return null;

  // If role is TEACHER, verify teacher is assigned
  if (role === 'TEACHER' && userId) {
    const isAssigned = cls.teachers.some((t) => t.user.id === userId);
    if (!isAssigned) {
      throw new Error('Access denied: You are not assigned to this class');
    }
  }

  return cls;
}

export async function updateClass(
  prisma: PrismaClient,
  id: string,
  data: UpdateClassInput
) {
  if (data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) {
      throw new Error('Associated course does not exist');
    }
  }

  return prisma.class.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.courseId ? { courseId: data.courseId } : {}),
      updatedAt: new Date(),
    },
    include: {
      course: true,
    },
  });
}

export async function deleteClass(prisma: PrismaClient, id: string) {
  await prisma.class.delete({
    where: { id },
  });
  return { success: true };
}

export async function assignTeacher(
  prisma: PrismaClient,
  classId: string,
  userId: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User does not exist');
  }

  const existing = await prisma.classTeacher.findUnique({
    where: {
      classId_userId: { classId, userId },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.classTeacher.create({
    data: {
      id: createId(),
      classId,
      userId,
    },
  });
}

export async function removeTeacher(
  prisma: PrismaClient,
  classId: string,
  userId: string
) {
  await prisma.classTeacher.deleteMany({
    where: {
      classId,
      userId,
    },
  });
  return { success: true };
}

export async function enrollStudent(
  prisma: PrismaClient,
  classId: string,
  studentId: string
) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error('Student does not exist');
  }

  const existing = await prisma.classStudent.findUnique({
    where: {
      classId_studentId: { classId, studentId },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.classStudent.create({
    data: {
      id: createId(),
      classId,
      studentId,
    },
  });
}

export async function unenrollStudent(
  prisma: PrismaClient,
  classId: string,
  studentId: string
) {
  await prisma.classStudent.deleteMany({
    where: {
      classId,
      studentId,
    },
  });
  return { success: true };
}
