import type { IncomingMessage, ServerResponse } from 'node:http';
import { prisma } from '../_lib/prisma';
import {
  createStudentSchema,
  type StudentWithAttendance,
  type CourseType,
  type AttendanceStatus,
} from '../_lib/types';
import { sendJson, parseJsonBody, getQueryParams } from '../_lib/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method?.toUpperCase();

  try {
    if (method === 'GET') {
      const query = getQueryParams(req);
      const date = query.get('date') || new Date().toISOString().slice(0, 10);
      const courseFilter = query.get('course');
      const searchFilter = query.get('search')?.toLowerCase().trim();

      const students = await prisma.student.findMany({
        where: {
          ...(courseFilter && courseFilter !== 'all' ? { course: courseFilter } : {}),
        },
        include: {
          records: {
            where: { date },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const mapped: StudentWithAttendance[] = students.map((s) => {
        const record = s.records[0];
        return {
          id: s.id,
          studentId: s.studentId,
          nameFa: s.nameFa,
          nameEn: s.nameEn,
          course: s.course as CourseType,
          guardianPhone: s.guardianPhone,
          avatarUrl: s.avatarUrl,
          status: (record?.status as AttendanceStatus) || 'absent',
          checkInTime: record?.checkInTime,
          checkOutTime: record?.checkOutTime,
        };
      });

      // Filter by search term if provided
      const filtered = searchFilter
        ? mapped.filter(
            (s) =>
              s.nameFa.toLowerCase().includes(searchFilter) ||
              s.nameEn.toLowerCase().includes(searchFilter) ||
              s.studentId.toLowerCase().includes(searchFilter) ||
              s.guardianPhone.includes(searchFilter)
          )
        : mapped;

      return sendJson(res, 200, { success: true, data: filtered });
    }

    if (method === 'POST') {
      const rawBody = await parseJsonBody(req);
      const parsed = createStudentSchema.safeParse(rawBody);

      if (!parsed.success) {
        return sendJson(res, 400, {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        });
      }

      const { nameFa, nameEn, course, guardianPhone, avatarUrl } = parsed.data;

      // Auto-generate student ID if not provided
      let studentId = parsed.data.studentId;
      if (!studentId) {
        const totalCount = await prisma.student.count();
        studentId = `BYT-${1050 + totalCount}`;
      }

      // Check unique studentId
      const existing = await prisma.student.findUnique({
        where: { studentId },
      });
      if (existing) {
        return sendJson(res, 409, {
          success: false,
          error: `Student with ID ${studentId} already exists`,
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const student = await prisma.student.create({
        data: {
          studentId,
          nameFa,
          nameEn,
          course,
          guardianPhone,
          avatarUrl: avatarUrl || null,
          records: {
            create: {
              date: today,
              status: 'absent',
            },
          },
        },
        include: {
          records: {
            where: { date: today },
            take: 1,
          },
        },
      });

      const result: StudentWithAttendance = {
        id: student.id,
        studentId: student.studentId,
        nameFa: student.nameFa,
        nameEn: student.nameEn,
        course: student.course as CourseType,
        guardianPhone: student.guardianPhone,
        avatarUrl: student.avatarUrl,
        status: (student.records[0]?.status as AttendanceStatus) || 'absent',
        checkInTime: student.records[0]?.checkInTime,
        checkOutTime: student.records[0]?.checkOutTime,
      };

      return sendJson(res, 201, { success: true, data: result });
    }

    return sendJson(res, 405, {
      success: false,
      error: `Method ${method} not allowed`,
    });
  } catch (error) {
    console.error('API /api/students error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}
