import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import {
  createTestClass,
  createTestUser,
  createTestStudent,
  createTestSession,
  assignTeacherToClass,
  enrollStudentInClass,
} from './helpers.js';
import {
  getAttendanceSheet,
  toggleAttendance,
} from '../api/attendance/service.js';

describe('Attendance Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('retrieves attendance sheet with absent default for enrolled students', async () => {
    const cls = await createTestClass(db.prisma);
    const s1 = await createTestStudent(db.prisma, { name: 'Student Alpha' });
    const s2 = await createTestStudent(db.prisma, { name: 'Student Beta' });

    await enrollStudentInClass(db.prisma, cls.id, s1.id);
    await enrollStudentInClass(db.prisma, cls.id, s2.id);

    const session = await createTestSession(db.prisma, { classId: cls.id });

    const sheet = await getAttendanceSheet(db.prisma, session.id, 'admin-id', 'ADMIN');
    expect(sheet.session.id).toBe(session.id);
    expect(sheet.students.length).toBe(2);
    expect(sheet.students[0].present).toBe(false);
    expect(sheet.students[1].present).toBe(false);
  });

  it('toggles attendance status and records timestamp', async () => {
    const cls = await createTestClass(db.prisma);
    const student = await createTestStudent(db.prisma, { name: 'Present Student' });
    await enrollStudentInClass(db.prisma, cls.id, student.id);
    const session = await createTestSession(db.prisma, { classId: cls.id });

    // Mark present
    const record = await toggleAttendance(
      db.prisma,
      session.id,
      student.id,
      true,
      'admin-id',
      'ADMIN'
    );

    expect(record.present).toBe(true);
    expect(record.checkedAt).toBeDefined();

    // Verify sheet
    const sheet = await getAttendanceSheet(db.prisma, session.id, 'admin-id', 'ADMIN');
    const studentEntry = sheet.students.find((s) => s.id === student.id);
    expect(studentEntry?.present).toBe(true);

    // Toggle back to absent
    const toggledBack = await toggleAttendance(
      db.prisma,
      session.id,
      student.id,
      false,
      'admin-id',
      'ADMIN'
    );
    expect(toggledBack.present).toBe(false);

    const sheetAfter = await getAttendanceSheet(db.prisma, session.id, 'admin-id', 'ADMIN');
    const studentEntryAfter = sheetAfter.students.find((s) => s.id === student.id);
    expect(studentEntryAfter?.present).toBe(false);
  });

  it('teacher can only manage attendance for assigned class sessions', async () => {
    const teacher = await createTestUser(db.prisma, { role: 'TEACHER' });
    const unassignedTeacher = await createTestUser(db.prisma, { role: 'TEACHER' });

    const cls = await createTestClass(db.prisma);
    await assignTeacherToClass(db.prisma, cls.id, teacher.id);
    const student = await createTestStudent(db.prisma);
    await enrollStudentInClass(db.prisma, cls.id, student.id);
    const session = await createTestSession(db.prisma, { classId: cls.id });

    // Assigned teacher succeeds
    const sheet = await getAttendanceSheet(db.prisma, session.id, teacher.id, 'TEACHER');
    expect(sheet.students.length).toBe(1);

    // Unassigned teacher fails
    await expect(
      getAttendanceSheet(db.prisma, session.id, unassignedTeacher.id, 'TEACHER')
    ).rejects.toThrow(/access denied/i);

    await expect(
      toggleAttendance(
        db.prisma,
        session.id,
        student.id,
        true,
        unassignedTeacher.id,
        'TEACHER'
      )
    ).rejects.toThrow(/access denied/i);
  });

  it('rejects attendance for non-enrolled student', async () => {
    const cls = await createTestClass(db.prisma);
    const session = await createTestSession(db.prisma, { classId: cls.id });
    const nonEnrolled = await createTestStudent(db.prisma, { name: 'Non Enrolled' });

    await expect(
      toggleAttendance(
        db.prisma,
        session.id,
        nonEnrolled.id,
        true,
        'admin-id',
        'ADMIN'
      )
    ).rejects.toThrow(/not enrolled/i);
  });
});
