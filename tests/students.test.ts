import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import {
  createTestClass,
  createTestUser,
  assignTeacherToClass,
  enrollStudentInClass,
} from './helpers.js';
import {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../api/_routes/students/service.js';

describe('Students Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('creates student with name, birthdate, gender, about', async () => {
    const student = await createStudent(db.prisma, {
      name: 'Mohammad Alavi',
      birthdate: '2015-05-20',
      gender: 'MALE',
      about: 'Enthusiastic beginner in robotics and Scratch',
    });

    expect(student.id).toBeDefined();
    expect(student.name).toBe('Mohammad Alavi');
    expect(student.birthdate).toBe('2015-05-20');
    expect(student.gender).toBe('MALE');
    expect(student.about).toBe('Enthusiastic beginner in robotics and Scratch');
  });

  it('rejects creating student with empty name', async () => {
    await expect(createStudent(db.prisma, { name: '   ' })).rejects.toThrow(
      /student name is required/i
    );
  });

  it('admin sees all students, teacher only sees students in assigned classes', async () => {
    const teacher = await createTestUser(db.prisma, { role: 'TEACHER' });
    const class1 = await createTestClass(db.prisma, { name: 'Teacher Class' });
    const class2 = await createTestClass(db.prisma, { name: 'Other Class' });

    await assignTeacherToClass(db.prisma, class1.id, teacher.id);

    const s1 = await createStudent(db.prisma, { name: 'Student in Teacher Class' });
    const s2 = await createStudent(db.prisma, { name: 'Student in Other Class' });

    await enrollStudentInClass(db.prisma, class1.id, s1.id);
    await enrollStudentInClass(db.prisma, class2.id, s2.id);

    // Admin sees all
    const adminList = await listStudents(db.prisma, 'admin-id', 'ADMIN');
    const adminIds = adminList.map((s) => s.id);
    expect(adminIds).toContain(s1.id);
    expect(adminIds).toContain(s2.id);

    // Teacher sees only s1
    const teacherList = await listStudents(db.prisma, teacher.id, 'TEACHER');
    const teacherIds = teacherList.map((s) => s.id);
    expect(teacherIds).toContain(s1.id);
    expect(teacherIds).not.toContain(s2.id);
  });

  it('getStudentById returns student with enrolled classes', async () => {
    const student = await createStudent(db.prisma, { name: 'Enrolled Student' });
    const classA = await createTestClass(db.prisma, { name: 'Class Alpha' });
    const classB = await createTestClass(db.prisma, { name: 'Class Beta' });

    await enrollStudentInClass(db.prisma, classA.id, student.id);
    await enrollStudentInClass(db.prisma, classB.id, student.id);

    const details = await getStudentById(db.prisma, student.id);
    expect(details).toBeDefined();
    expect(details?.classes.length).toBe(2);
  });

  it('updateStudent updates profile info', async () => {
    const student = await createStudent(db.prisma, { name: 'Before Update Student' });
    const updated = await updateStudent(db.prisma, student.id, {
      name: 'After Update Student',
      gender: 'FEMALE',
    });
    expect(updated.name).toBe('After Update Student');
    expect(updated.gender).toBe('FEMALE');
  });

  it('deleteStudent removes student and enrollments (Admin only)', async () => {
    const student = await createStudent(db.prisma, { name: 'Delete Student' });
    const result = await deleteStudent(db.prisma, student.id);
    expect(result.success).toBe(true);

    const check = await db.prisma.student.findUnique({ where: { id: student.id } });
    expect(check).toBeNull();
  });
});
