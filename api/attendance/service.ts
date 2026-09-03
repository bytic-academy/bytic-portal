import type { PrismaClient } from '../_lib/prisma.js';
import { createId } from '@paralleldrive/cuid2';

async function verifySessionAccess(
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
  role: string
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      class: {
        include: {
          teachers: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (role === 'ADMIN') return session;

  const isAssigned = session.class.teachers.some((t) => t.userId === userId);
  if (!isAssigned) {
    throw new Error('Access denied: You are not assigned to this class');
  }

  return session;
}

export interface StudentAttendanceEntry {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  present: boolean;
  checkedAt: Date | null;
}

export async function getAttendanceSheet(
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
  role: string
) {
  const session = await verifySessionAccess(prisma, sessionId, userId, role);

  // Get all students enrolled in this class
  const classStudents = await prisma.classStudent.findMany({
    where: { classId: session.classId },
    include: {
      student: true,
    },
    orderBy: {
      student: { name: 'asc' },
    },
  });

  // Get existing attendance records for this session
  const records = await prisma.attendanceRecord.findMany({
    where: { sessionId },
  });

  const recordMap = new Map(records.map((r) => [r.studentId, r]));

  const students: StudentAttendanceEntry[] = classStudents.map((cs) => {
    const rec = recordMap.get(cs.studentId);
    return {
      id: cs.student.id,
      name: cs.student.name,
      birthdate: cs.student.birthdate,
      gender: cs.student.gender,
      present: rec ? Boolean(rec.present) : false,
      checkedAt: rec ? rec.checkedAt : null,
    };
  });

  return {
    session: {
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      classId: session.classId,
      class: session.class,
    },
    students,
    totalEnrolled: students.length,
    presentCount: students.filter((s) => s.present).length,
    absentCount: students.filter((s) => !s.present).length,
  };
}

export async function toggleAttendance(
  prisma: PrismaClient,
  sessionId: string,
  studentId: string,
  present: boolean,
  userId: string,
  role: string
) {
  const session = await verifySessionAccess(prisma, sessionId, userId, role);

  // Check enrollment
  const enrollment = await prisma.classStudent.findUnique({
    where: {
      classId_studentId: {
        classId: session.classId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('Student is not enrolled in this class');
  }

  const record = await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId,
      },
    },
    create: {
      id: createId(),
      sessionId,
      studentId,
      present,
      checkedAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      present,
      checkedAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      student: true,
    },
  });

  return record;
}
