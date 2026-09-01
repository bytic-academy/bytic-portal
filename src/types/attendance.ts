export type CourseType = 'scratch_jr' | 'scratch' | 'web_design' | 'python';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified';

export interface Student {
  id: string;
  studentId: string;
  nameFa: string;
  nameEn: string;
  course: CourseType;
  guardianPhone: string;
  avatarUrl?: string | null;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export type StudentWithAttendance = Student;

export interface CreateStudentInput {
  studentId?: string;
  nameFa: string;
  nameEn: string;
  course: CourseType;
  guardianPhone: string;
  avatarUrl?: string | null;
}

export interface UpdateAttendanceInput {
  studentId: string;
  date?: string;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  notes?: string | null;
}

export interface AttendanceStatsData {
  total: number;
  present: number;
  absent: number;
  late: number;
  justified: number;
  presentPercentage: number;
}
