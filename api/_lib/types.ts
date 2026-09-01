import { z } from 'zod';
import type {
  CourseType,
  AttendanceStatus,
  StudentWithAttendance,
  AttendanceStatsData,
} from '../../src/types/attendance';

export const courseTypes: readonly [CourseType, ...CourseType[]] = [
  'scratch_jr',
  'scratch',
  'web_design',
  'python',
];

export const attendanceStatuses: readonly [AttendanceStatus, ...AttendanceStatus[]] = [
  'present',
  'absent',
  'late',
  'justified',
];

export const createStudentSchema = z.object({
  studentId: z.string().min(3).optional(),
  nameFa: z.string().min(2, 'Persian name is required'),
  nameEn: z.string().min(2, 'English name is required'),
  course: z.enum(courseTypes),
  guardianPhone: z.string().min(10, 'Valid phone number is required'),
  avatarUrl: z.string().url().optional().nullable(),
});

export const updateAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  status: z.enum(attendanceStatuses),
  checkInTime: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const markAllPresentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  course: z.enum([...courseTypes, 'all']).optional().default('all'),
});

export type {
  CourseType,
  AttendanceStatus,
  StudentWithAttendance,
  AttendanceStatsData,
};
