import type { IncomingMessage, ServerResponse } from 'node:http';
import { prisma } from './_lib/prisma';
import type { AttendanceStatsData } from './_lib/types';
import { sendJson, getQueryParams } from './_lib/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method?.toUpperCase();

  try {
    if (method === 'GET') {
      const query = getQueryParams(req);
      const date = query.get('date') || new Date().toISOString().slice(0, 10);
      const courseFilter = query.get('course');

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
      });

      let present = 0;
      let absent = 0;
      let late = 0;
      let justified = 0;

      for (const s of students) {
        const status = s.records[0]?.status || 'absent';
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'late') late++;
        else if (status === 'justified') justified++;
        else absent++;
      }

      const total = students.length;
      const presentPercentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      const data: AttendanceStatsData = {
        total,
        present,
        absent,
        late,
        justified,
        presentPercentage,
      };

      return sendJson(res, 200, { success: true, data });
    }

    return sendJson(res, 405, {
      success: false,
      error: `Method ${method} not allowed`,
    });
  } catch (error) {
    console.error('API /api/stats error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}
