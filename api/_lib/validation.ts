import { z } from 'zod';

// ─── Shared Enums ───

export const Role = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

// ─── Auth Schemas ───

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ─── User Schemas ───

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER']).default('TEACHER'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'TEACHER']).optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Course Schemas ───

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── Class Schemas ───

export const createClassSchema = z.object({
  name: z.string().default(''),
  courseId: z.string().min(1, 'Course ID is required'),
});
export type CreateClassInput = z.infer<typeof createClassSchema>;

export const updateClassSchema = z.object({
  name: z.string().optional(),
  courseId: z.string().optional(),
});
export type UpdateClassInput = z.infer<typeof updateClassSchema>;

export const assignTeacherSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const enrollStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
});

// ─── Student Schemas ───

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Student name is required'),
  birthdate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  about: z.string().optional(),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  birthdate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  about: z.string().optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

// ─── Session Schemas ───

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createSessionSchema = z
  .object({
    classId: z.string().min(1, 'Class ID is required'),
    date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD format'),
    startTime: z.string().regex(timeRegex, 'Start time must be HH:MM format'),
    endTime: z.string().regex(timeRegex, 'End time must be HH:MM format'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const bulkCreateSessionSchema = z
  .object({
    classId: z.string().min(1, 'Class ID is required'),
    dates: z
      .array(z.string().regex(dateRegex, 'Each date must be YYYY-MM-DD format'))
      .min(1, 'At least one date is required'),
    startTime: z.string().regex(timeRegex, 'Start time must be HH:MM format'),
    endTime: z.string().regex(timeRegex, 'End time must be HH:MM format'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });
export type BulkCreateSessionInput = z.infer<typeof bulkCreateSessionSchema>;

export const updateSessionSchema = z
  .object({
    date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD format').optional(),
    startTime: z.string().regex(timeRegex, 'Start time must be HH:MM format').optional(),
    endTime: z.string().regex(timeRegex, 'End time must be HH:MM format').optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

// ─── Attendance Schemas ───

export const toggleAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  present: z.boolean(),
});
export type ToggleAttendanceInput = z.infer<typeof toggleAttendanceSchema>;
