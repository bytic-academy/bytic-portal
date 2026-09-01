import { describe, it, expect } from 'vitest';
import {
  createStudentSchema,
  updateAttendanceSchema,
  markAllPresentSchema,
} from '../api/_lib/types';

describe('API Zod Validation Schemas', () => {
  describe('createStudentSchema', () => {
    it('accepts valid student payload', () => {
      const validPayload = {
        nameFa: 'پارسا صادقی',
        nameEn: 'Parsa Sadeghi',
        course: 'scratch_jr',
        guardianPhone: '09121234567',
        studentId: 'BYT-1050',
      };
      const result = createStudentSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects payload with invalid course', () => {
      const invalidPayload = {
        nameFa: 'پارسا صادقی',
        nameEn: 'Parsa Sadeghi',
        course: 'invalid_course_name',
        guardianPhone: '09121234567',
      };
      const result = createStudentSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects payload with short Persian name', () => {
      const invalidPayload = {
        nameFa: 'پ',
        nameEn: 'Parsa',
        course: 'scratch',
        guardianPhone: '09121234567',
      };
      const result = createStudentSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAttendanceSchema', () => {
    it('accepts valid attendance update', () => {
      const valid = {
        studentId: 'BYT-1050',
        status: 'present',
        date: '2026-09-01',
        checkInTime: '16:30',
      };
      const result = updateAttendanceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid date format', () => {
      const invalid = {
        studentId: 'BYT-1050',
        status: 'present',
        date: '01/09/2026', // non ISO
      };
      const result = updateAttendanceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const invalid = {
        studentId: 'BYT-1050',
        status: 'unknown_status',
      };
      const result = updateAttendanceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('markAllPresentSchema', () => {
    it('accepts empty or course-scoped payload', () => {
      expect(markAllPresentSchema.safeParse({}).success).toBe(true);
      expect(markAllPresentSchema.safeParse({ course: 'scratch', date: '2026-09-01' }).success).toBe(true);
      expect(markAllPresentSchema.safeParse({ course: 'all' }).success).toBe(true);
    });
  });
});
