import * as React from 'react';
import { api } from '@/lib/api';
import type {
  Student,
  AttendanceStatus,
  CreateStudentInput,
  CourseType,
} from '@/types/attendance';
import { initialStudents } from '@/data/mockStudents';

export function useAttendanceData() {
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initial fetch from API
  const fetchStudents = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local state:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
      // Keep initialStudents as fallback for smooth offline UX
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Optimistic update status
  const updateStatus = React.useCallback(
    async (id: string, newStatus: AttendanceStatus, locale: string = 'fa') => {
      const now = new Date().toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let previousStudent: Student | undefined;

      // Optimistic update
      setStudents((prev) => {
        return prev.map((student) => {
          if (student.id !== id && student.studentId !== id) return student;
          previousStudent = student;
          return {
            ...student,
            status: newStatus,
            checkInTime:
              newStatus === 'present' || newStatus === 'late'
                ? student.checkInTime || now
                : undefined,
          };
        });
      });

      try {
        setIsSyncing(true);
        await api.updateAttendance({
          studentId: id,
          status: newStatus,
        });
      } catch (err) {
        console.error('Failed to sync status update to backend:', err);
        // Rollback on error
        if (previousStudent) {
          setStudents((prev) =>
            prev.map((s) => (s.id === id || s.studentId === id ? previousStudent! : s))
          );
        }
        setError(err instanceof Error ? err.message : 'Failed to sync update');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Add student
  const addStudent = React.useCallback(
    async (newStudent: CreateStudentInput) => {
      try {
        setIsSyncing(true);
        const created = await api.createStudent(newStudent);
        setStudents((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Failed to create student on backend:', err);
        // Optimistic local fallback if API fails
        const fallback: Student = {
          id: String(Date.now()),
          studentId: newStudent.studentId || `BYT-${Math.floor(1000 + Math.random() * 9000)}`,
          nameFa: newStudent.nameFa,
          nameEn: newStudent.nameEn,
          course: newStudent.course as CourseType,
          guardianPhone: newStudent.guardianPhone,
          avatarUrl: newStudent.avatarUrl,
          status: 'absent',
        };
        setStudents((prev) => [fallback, ...prev]);
        setError(err instanceof Error ? err.message : 'Created offline');
        return fallback;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mark all present
  const markAllPresent = React.useCallback(
    async (selectedCourse: string = 'all', locale: string = 'fa') => {
      const now = new Date().toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const previousStudents = [...students];

      // Optimistic update
      setStudents((prev) =>
        prev.map((s) => {
          if (selectedCourse !== 'all' && s.course !== selectedCourse) return s;
          return {
            ...s,
            status: 'present',
            checkInTime: s.checkInTime || now,
          };
        })
      );

      try {
        setIsSyncing(true);
        await api.markAllPresent({
          course: selectedCourse === 'all' ? undefined : selectedCourse,
        });
      } catch (err) {
        console.error('Failed to sync mark all present:', err);
        // Rollback
        setStudents(previousStudents);
        setError(err instanceof Error ? err.message : 'Failed to mark all present');
      } finally {
        setIsSyncing(false);
      }
    },
    [students]
  );

  return {
    students,
    isLoading,
    isSyncing,
    error,
    updateStatus,
    addStudent,
    markAllPresent,
    refresh: fetchStudents,
  };
}
