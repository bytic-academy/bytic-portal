import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import {
  createTestClass,
  createTestUser,
  assignTeacherToClass,
} from './helpers.js';
import {
  createSession,
  bulkCreateSessions,
  listSessionsByClass,
  getSessionById,
  updateSession,
  deleteSession,
} from '../api/sessions/service.js';

describe('Sessions Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('admin creates a single session for a class', async () => {
    const cls = await createTestClass(db.prisma);
    const session = await createSession(
      db.prisma,
      {
        classId: cls.id,
        date: '2026-09-10',
        startTime: '10:00',
        endTime: '11:30',
      },
      'admin-id',
      'ADMIN'
    );

    expect(session.id).toBeDefined();
    expect(session.date).toBe('2026-09-10');
    expect(session.startTime).toBe('10:00');
    expect(session.endTime).toBe('11:30');
    expect(session.classId).toBe(cls.id);
  });

  it('assigned teacher creates a session for their class', async () => {
    const teacher = await createTestUser(db.prisma, { role: 'TEACHER' });
    const cls = await createTestClass(db.prisma);
    await assignTeacherToClass(db.prisma, cls.id, teacher.id);

    const session = await createSession(
      db.prisma,
      {
        classId: cls.id,
        date: '2026-09-12',
        startTime: '14:00',
        endTime: '15:30',
      },
      teacher.id,
      'TEACHER'
    );

    expect(session.id).toBeDefined();
  });

  it('unassigned teacher is rejected with access error', async () => {
    const unassignedTeacher = await createTestUser(db.prisma, { role: 'TEACHER' });
    const cls = await createTestClass(db.prisma);

    await expect(
      createSession(
        db.prisma,
        {
          classId: cls.id,
          date: '2026-09-12',
          startTime: '14:00',
          endTime: '15:30',
        },
        unassignedTeacher.id,
        'TEACHER'
      )
    ).rejects.toThrow(/access denied/i);
  });

  it('atomic bulk creation generates one session per date with shared time window', async () => {
    const cls = await createTestClass(db.prisma);
    const dates = ['2026-09-15', '2026-09-22', '2026-09-29', '2026-10-06'];

    const result = await bulkCreateSessions(
      db.prisma,
      {
        classId: cls.id,
        dates,
        startTime: '09:00',
        endTime: '10:30',
      },
      'admin-id',
      'ADMIN'
    );

    expect(result.length).toBe(4);
    expect(result.map((s) => s.date)).toEqual(dates);
    result.forEach((s) => {
      expect(s.classId).toBe(cls.id);
      expect(s.startTime).toBe('09:00');
      expect(s.endTime).toBe('10:30');
    });

    // Check DB
    const list = await listSessionsByClass(db.prisma, cls.id, 'admin-id', 'ADMIN');
    expect(list.length).toBe(4);
  });

  it('listSessionsByClass returns sessions ordered chronologically', async () => {
    const cls = await createTestClass(db.prisma);

    await createSession(
      db.prisma,
      { classId: cls.id, date: '2026-09-20', startTime: '10:00', endTime: '11:00' },
      'admin-id',
      'ADMIN'
    );
    await createSession(
      db.prisma,
      { classId: cls.id, date: '2026-09-10', startTime: '10:00', endTime: '11:00' },
      'admin-id',
      'ADMIN'
    );

    const list = await listSessionsByClass(db.prisma, cls.id, 'admin-id', 'ADMIN');
    expect(list[0].date).toBe('2026-09-10');
    expect(list[1].date).toBe('2026-09-20');
  });

  it('updateSession modifies schedule', async () => {
    const cls = await createTestClass(db.prisma);
    const session = await createSession(
      db.prisma,
      { classId: cls.id, date: '2026-09-10', startTime: '10:00', endTime: '11:00' },
      'admin-id',
      'ADMIN'
    );

    const updated = await updateSession(
      db.prisma,
      session.id,
      { date: '2026-09-11', startTime: '11:00', endTime: '12:30' },
      'admin-id',
      'ADMIN'
    );

    expect(updated.date).toBe('2026-09-11');
    expect(updated.startTime).toBe('11:00');
    expect(updated.endTime).toBe('12:30');
  });

  it('deleteSession removes session and associated attendance records', async () => {
    const cls = await createTestClass(db.prisma);
    const session = await createSession(
      db.prisma,
      { classId: cls.id, date: '2026-09-10', startTime: '10:00', endTime: '11:00' },
      'admin-id',
      'ADMIN'
    );

    const result = await deleteSession(db.prisma, session.id, 'admin-id', 'ADMIN');
    expect(result.success).toBe(true);

    const check = await db.prisma.session.findUnique({ where: { id: session.id } });
    expect(check).toBeNull();
  });
});
