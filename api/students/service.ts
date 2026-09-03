import type { PrismaClient } from '../_lib/prisma.js';
import { createId } from '@paralleldrive/cuid2';
import type { CreateStudentInput, UpdateStudentInput } from '../_lib/validation.js';

export async function createStudent(
  prisma: PrismaClient,
  data: CreateStudentInput
) {
  const name = data.name.trim();
  if (!name) {
    throw new Error('Student name is required and non-empty');
  }

  return prisma.student.create({
    data: {
      id: createId(),
      name,
      birthdate: data.birthdate || null,
      gender: data.gender || null,
      about: data.about ? data.about.trim() : null,
      updatedAt: new Date(),
    },
  });
}

export async function listStudents(
  prisma: PrismaClient,
  userId: string,
  role: string
) {
  if (role === 'ADMIN') {
    return prisma.student.findMany({
      include: {
        classes: {
          include: {
            class: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Teacher sees only students enrolled in their assigned classes
  return prisma.student.findMany({
    where: {
      classes: {
        some: {
          class: {
            teachers: {
              some: {
                userId,
              },
            },
          },
        },
      },
    },
    include: {
      classes: {
        include: {
          class: {
            include: { course: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getStudentById(
  prisma: PrismaClient,
  id: string,
  userId?: string,
  role?: string
) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          class: {
            include: {
              course: true,
              teachers: true,
            },
          },
        },
      },
      attendance: {
        include: {
          session: {
            include: { class: true },
          },
        },
        orderBy: {
          checkedAt: 'desc',
        },
      },
    },
  });

  if (!student) return null;

  if (role === 'TEACHER' && userId) {
    // Check if teacher is assigned to at least one class the student is in
    const hasAccess = student.classes.some((c) =>
      c.class.teachers.some((t) => t.userId === userId)
    );
    if (!hasAccess) {
      throw new Error('Access denied: You do not teach this student');
    }
  }

  return student;
}

export async function updateStudent(
  prisma: PrismaClient,
  id: string,
  data: UpdateStudentInput
) {
  const name = data.name !== undefined ? data.name.trim() : undefined;
  if (name !== undefined && !name) {
    throw new Error('Student name is required and non-empty');
  }

  return prisma.student.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(data.birthdate !== undefined ? { birthdate: data.birthdate || null } : {}),
      ...(data.gender !== undefined ? { gender: data.gender || null } : {}),
      ...(data.about !== undefined ? { about: data.about ? data.about.trim() : null } : {}),
      updatedAt: new Date(),
    },
  });
}

export async function deleteStudent(prisma: PrismaClient, id: string) {
  await prisma.student.delete({
    where: { id },
  });
  return { success: true };
}
