import type { IncomingMessage, ServerResponse } from 'node:http';
import { prisma } from '../_lib/prisma';
import { updateAttendanceSchema } from '../_lib/types';
import { sendJson, parseJsonBody } from '../_lib/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method?.toUpperCase();

  try {
    if (method === 'PATCH' || method === 'PUT') {
      const rawBody = await parseJsonBody(req);
      const parsed = updateAttendanceSchema.safeParse(rawBody);

      if (!parsed.success) {
        return sendJson(res, 400, {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        });
      }

      const { studentId, status, checkInTime, checkOutTime, notes } = parsed.data;
      const date = parsed.data.date || new Date().toISOString().slice(0, 10);

      // Verify student exists (check by DB id or BYT studentId)
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ id: studentId }, { studentId: studentId }],
        },
      });

      if (!student) {
        return sendJson(res, 404, {
          success: false,
          error: `Student not found for ID ${studentId}`,
        });
      }

      // Compute default check-in time if present or late and not specified
      let finalCheckInTime = checkInTime;
      if ((status === 'present' || status === 'late') && finalCheckInTime === undefined) {
        finalCheckInTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } else if (status === 'absent' || status === 'justified') {
        finalCheckInTime = null;
      }

      const record = await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date,
          },
        },
        update: {
          status,
          checkInTime: finalCheckInTime,
          ...(checkOutTime !== undefined ? { checkOutTime } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
        create: {
          studentId: student.id,
          date,
          status,
          checkInTime: finalCheckInTime,
          checkOutTime: checkOutTime || null,
          notes: notes || null,
        },
      });

      return sendJson(res, 200, {
        success: true,
        data: {
          id: student.id,
          studentId: student.studentId,
          date: record.date,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          notes: record.notes,
        },
      });
    }

    return sendJson(res, 405, {
      success: false,
      error: `Method ${method} not allowed`,
    });
  } catch (error) {
    console.error('API /api/attendance error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}
