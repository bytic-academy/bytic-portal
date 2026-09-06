import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

// ─── Types ───

export interface Course {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { classes: number };
}

export interface TeacherAssignment {
  id: string;
  classId: string;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface StudentEnrollment {
  id: string;
  classId: string;
  studentId: string;
  student: Student;
}

export interface ClassEntity {
  id: string;
  name: string;
  courseId: string;
  course: Course;
  teachers: TeacherAssignment[];
  students: StudentEnrollment[];
  sessions?: SessionEntity[];
  _count?: { students: number; sessions: number };
}

export interface Student {
  id: string;
  name: string;
  birthdate?: string | null;
  gender?: 'MALE' | 'FEMALE' | null;
  about?: string | null;
  classes?: { id: string; class: { id: string; name: string; course: { name: string } } }[];
}

export interface SessionEntity {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  _count?: { attendance: number };
}

export interface AttendanceStudentEntry {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  present: boolean;
  checkedAt: string | null;
}

export interface AttendanceSheet {
  session: SessionEntity & { class: ClassEntity };
  students: AttendanceStudentEntry[];
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  createdAt: string;
}

// ─── Courses Hooks ───

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchApi<{ courses: Course[] }>('/api/courses').then((d) => d.courses),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => fetchApi<{ course: Course }>('/api/courses/' + id).then((d) => d.course),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      fetchApi('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      fetchApi('/api/courses/' + id, { method: 'PUT', body: JSON.stringify({ name }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi('/api/courses/' + id, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

// ─── Classes Hooks ───

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => fetchApi<{ classes: ClassEntity[] }>('/api/classes').then((d) => d.classes),
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => fetchApi<{ class: ClassEntity }>('/api/classes/' + id).then((d) => d.class),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; courseId: string }) =>
      fetchApi('/api/classes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; courseId?: string }) =>
      fetchApi('/api/classes/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      qc.invalidateQueries({ queryKey: ['classes', variables.id] });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi('/api/classes/' + id, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useAssignTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, userId }: { classId: string; userId: string }) =>
      fetchApi('/api/classes/' + classId + '/teachers', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['classes', variables.classId] }),
  });
}

export function useRemoveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, userId }: { classId: string; userId: string }) =>
      fetchApi('/api/classes/' + classId + '/teachers/' + userId, { method: 'DELETE' }),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['classes', variables.classId] }),
  });
}

export function useEnrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      fetchApi('/api/classes/' + classId + '/students', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      }),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['classes', variables.classId] }),
  });
}

export function useUnenrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      fetchApi('/api/classes/' + classId + '/students/' + studentId, { method: 'DELETE' }),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['classes', variables.classId] }),
  });
}

// ─── Students Hooks ───

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => fetchApi<{ students: Student[] }>('/api/students').then((d) => d.students),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => fetchApi<{ student: Student }>('/api/students/' + id).then((d) => d.student),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; birthdate?: string; gender?: string; about?: string }) =>
      fetchApi('/api/students', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; birthdate?: string; gender?: string; about?: string }) =>
      fetchApi('/api/students/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi('/api/students/' + id, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

// ─── Sessions Hooks ───

export function useClassSessions(classId: string) {
  return useQuery({
    queryKey: ['sessions', { classId }],
    queryFn: () =>
      fetchApi<{ sessions: SessionEntity[] }>('/api/sessions?classId=' + classId).then(
        (d) => d.sessions
      ),
    enabled: Boolean(classId),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; date: string; startTime: string; endTime: string }) =>
      fetchApi('/api/sessions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['sessions', { classId: variables.classId }] });
      qc.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

export function useBulkCreateSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; dates: string[]; startTime: string; endTime: string }) =>
      fetchApi('/api/sessions/bulk', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['sessions', { classId: variables.classId }] });
      qc.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string; classId: string }) =>
      fetchApi('/api/sessions/' + sessionId, { method: 'DELETE' }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['sessions', { classId: variables.classId }] });
      qc.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

// ─── Attendance Hooks ───

export function useAttendanceSheet(sessionId: string) {
  return useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: () =>
      fetchApi<AttendanceSheet>('/api/sessions/' + sessionId + '/attendance'),
    enabled: Boolean(sessionId),
  });
}

export function useToggleAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
      present,
    }: {
      sessionId: string;
      studentId: string;
      present: boolean;
    }) =>
      fetchApi('/api/sessions/' + sessionId + '/attendance', {
        method: 'POST',
        body: JSON.stringify({ studentId, present }),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['attendance', variables.sessionId] });
    },
  });
}

// ─── Users (Admin) Hooks ───

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchApi<{ users: UserAccount[] }>('/api/users').then((d) => d.users),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: 'ADMIN' | 'TEACHER' }) =>
      fetchApi('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; email?: string; role?: 'ADMIN' | 'TEACHER' }) =>
      fetchApi('/api/users/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      id,
      password,
      currentPassword,
    }: {
      id: string;
      password: string;
      currentPassword?: string;
    }) =>
      fetchApi('/api/users/' + id + '/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password, currentPassword }),
      }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi('/api/users/' + id, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
