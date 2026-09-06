import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import {
  createTestCourse,
  createTestUser,
  createTestStudent,
} from './helpers.js';
import {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacher,
  removeTeacher,
  enrollStudent,
  unenrollStudent,
} from '../api/_routes/classes/service.js';

describe('Classes Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('admin creates a class linked to a course', async () => {
    const course = await createTestCourse(db.prisma, { name: 'Python Pro' });
    const cls = await createClass(db.prisma, {
      name: 'Class A',
      courseId: course.id,
    });

    expect(cls.id).toBeDefined();
    expect(cls.name).toBe('Class A');
    expect(cls.courseId).toBe(course.id);
  });

  it('admin lists all classes, teacher only sees assigned classes', async () => {
    const course = await createTestCourse(db.prisma);
    const teacher1 = await createTestUser(db.prisma, { role: 'TEACHER' });
    const teacher2 = await createTestUser(db.prisma, { role: 'TEACHER' });

    const class1 = await createClass(db.prisma, { name: 'Teacher1 Class', courseId: course.id });
    const class2 = await createClass(db.prisma, { name: 'Teacher2 Class', courseId: course.id });

    await assignTeacher(db.prisma, class1.id, teacher1.id);
    await assignTeacher(db.prisma, class2.id, teacher2.id);

    // Admin sees all
    const adminClasses = await listClasses(db.prisma, 'admin-id', 'ADMIN');
    expect(adminClasses.length).toBeGreaterThanOrEqual(2);

    // Teacher1 only sees class1
    const teacher1Classes = await listClasses(db.prisma, teacher1.id, 'TEACHER');
    const ids = teacher1Classes.map((c) => c.id);
    expect(ids).toContain(class1.id);
    expect(ids).not.toContain(class2.id);
  });

  it('assigns and removes multiple teachers from a class (M:M)', async () => {
    const course = await createTestCourse(db.prisma);
    const cls = await createClass(db.prisma, { name: 'Multi-Teacher Class', courseId: course.id });
    const t1 = await createTestUser(db.prisma, { role: 'TEACHER' });
    const t2 = await createTestUser(db.prisma, { role: 'TEACHER' });

    await assignTeacher(db.prisma, cls.id, t1.id);
    await assignTeacher(db.prisma, cls.id, t2.id);

    const classDetails = await getClassById(db.prisma, cls.id);
    expect(classDetails?.teachers.length).toBe(2);

    // Remove t1
    await removeTeacher(db.prisma, cls.id, t1.id);
    const updated = await getClassById(db.prisma, cls.id);
    expect(updated?.teachers.length).toBe(1);
    expect(updated?.teachers[0].user.id).toBe(t2.id);
  });

  it('enrolls and unenrolls students in a class (M:M)', async () => {
    const course = await createTestCourse(db.prisma);
    const cls = await createClass(db.prisma, { name: 'Enrolled Class', courseId: course.id });
    const s1 = await createTestStudent(db.prisma, { name: 'Student 1' });
    const s2 = await createTestStudent(db.prisma, { name: 'Student 2' });

    await enrollStudent(db.prisma, cls.id, s1.id);
    await enrollStudent(db.prisma, cls.id, s2.id);

    const classDetails = await getClassById(db.prisma, cls.id);
    expect(classDetails?.students.length).toBe(2);

    // Unenroll s1
    await unenrollStudent(db.prisma, cls.id, s1.id);
    const updated = await getClassById(db.prisma, cls.id);
    expect(updated?.students.length).toBe(1);
    expect(updated?.students[0].student.id).toBe(s2.id);
  });

  it('updateClass modifies class name', async () => {
    const course = await createTestCourse(db.prisma);
    const cls = await createClass(db.prisma, { name: 'Before Rename', courseId: course.id });
    const updated = await updateClass(db.prisma, cls.id, { name: 'After Rename' });
    expect(updated.name).toBe('After Rename');
  });

  it('deleteClass removes class and associated links', async () => {
    const course = await createTestCourse(db.prisma);
    const cls = await createClass(db.prisma, { name: 'To Delete Class', courseId: course.id });
    const result = await deleteClass(db.prisma, cls.id);
    expect(result.success).toBe(true);

    const check = await db.prisma.class.findUnique({ where: { id: cls.id } });
    expect(check).toBeNull();
  });
});
