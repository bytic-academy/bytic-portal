import type { PrismaClient } from '../_lib/prisma.js';
import { createId } from '@paralleldrive/cuid2';
import type { CreateCourseInput, UpdateCourseInput } from '../_lib/validation.js';

export async function createCourse(
  prisma: PrismaClient,
  data: CreateCourseInput
) {
  const name = data.name.trim();
  if (!name) {
    throw new Error('Course name is required and non-empty');
  }

  return prisma.course.create({
    data: {
      id: createId(),
      name,
      updatedAt: new Date(),
    },
  });
}

export async function listCourses(prisma: PrismaClient) {
  return prisma.course.findMany({
    include: {
      _count: {
        select: { classes: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCourseById(prisma: PrismaClient, id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          _count: {
            select: { students: true, sessions: true, teachers: true },
          },
        },
      },
    },
  });
}

export async function updateCourse(
  prisma: PrismaClient,
  id: string,
  data: UpdateCourseInput
) {
  const name = data.name.trim();
  if (!name) {
    throw new Error('Course name is required and non-empty');
  }

  return prisma.course.update({
    where: { id },
    data: {
      name,
      updatedAt: new Date(),
    },
  });
}

export async function deleteCourse(prisma: PrismaClient, id: string) {
  await prisma.course.delete({
    where: { id },
  });
  return { success: true };
}
