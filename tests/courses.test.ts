import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from './setup.js';
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../api/courses/service.js';

describe('Courses Service (TDD)', () => {
  let db: TestDb;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  it('creates a new course with valid name', async () => {
    const course = await createCourse(db.prisma, { name: 'Scratch Jr' });
    expect(course.id).toBeDefined();
    expect(course.name).toBe('Scratch Jr');
  });

  it('rejects creating course with empty name', async () => {
    await expect(createCourse(db.prisma, { name: '   ' })).rejects.toThrow(
      /course name is required/i
    );
  });

  it('listCourses returns all courses with class count', async () => {
    await createCourse(db.prisma, { name: 'Python Basics' });
    const courses = await listCourses(db.prisma);
    expect(courses.length).toBeGreaterThanOrEqual(2);
    expect(courses[0].name).toBeDefined();
  });

  it('getCourseById returns course with details', async () => {
    const created = await createCourse(db.prisma, { name: 'Kids Web Design' });
    const course = await getCourseById(db.prisma, created.id);
    expect(course).toBeDefined();
    expect(course?.name).toBe('Kids Web Design');
  });

  it('updateCourse modifies course name', async () => {
    const created = await createCourse(db.prisma, { name: 'Old Course Name' });
    const updated = await updateCourse(db.prisma, created.id, {
      name: 'Updated Course Name',
    });
    expect(updated.name).toBe('Updated Course Name');
  });

  it('deleteCourse removes the course', async () => {
    const created = await createCourse(db.prisma, { name: 'Course to delete' });
    const result = await deleteCourse(db.prisma, created.id);
    expect(result.success).toBe(true);

    const check = await db.prisma.course.findUnique({
      where: { id: created.id },
    });
    expect(check).toBeNull();
  });
});
