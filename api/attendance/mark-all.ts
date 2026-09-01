import type { IncomingMessage, ServerResponse } from 'node:http';
import { prisma } from '../_lib/prisma';
import { markAllPresentSchema } from '../_lib/types';
import { sendJson, parseJsonBody } from '../_lib/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method?.toUpperCase();

  try {
    if (method === 'POST') {
      const rawBody = await parseJsonBody(req);
      const parsed = markAllPresentSchema.safeParse(rawBody);

      if (!parsed.success) {
        return sendJson(res, 400, {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        });
      }

      const date = parsed.data.date || new Date().toISOString().slice(0, 10);
      const course = parsed.data.course || 'all';

      const students = await prisma.student.findMany({
        where: {
          ...(course !== 'all' ? { course } : {}),
        },
      });

      const now = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Update/Create records for all matching students
      await Promise.all(
        students.map((s) =>
          prisma.attendanceRecord.upsert({
            where: {
              studentId_date: {
                studentId: s.id,
                date,
              },
            },
            update: {
              status: 'present',
              checkInTime: now,
            },
            create: {
              studentId: s.id,
              date,
              status: 'present',
              checkInTime: now,
            },
          })
        )
      );

      return sendJson(res, 200, {
        success: true,
        data: {
          date,
          updatedCount: students.length,
          course,
        },
      });
    }

    return sendJson(res, 405, {
      success: false,
      error: `Method ${method} not allowed`,
    });
  } catch (error) {
    console.error('API /api/attendance/mark-all error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}
