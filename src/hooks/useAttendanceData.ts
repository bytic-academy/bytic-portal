import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { getTodayISO } from '@/lib/date';
import type {
  Student,
  AttendanceStatus,
  CreateStudentInput,
} from '@/types/attendance';

interface UseAttendanceDataOptions {
  date?: string;
  course?: string;
  search?: string;
}

export function useAttendanceData(options: UseAttendanceDataOptions = {}) {
  const queryClient = useQueryClient();
  const date = options.date || getTodayISO();
  const course = options.course;
  const search = options.search;

  const queryKey = ['students', { date, course, search }];

  // 1. Query for students with attendance on the specified date
  const {
    data: students = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => api.getStudents({ date, course, search }),
  });

  // 2. Mutation for updating single student status
  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: AttendanceStatus; locale?: string }) =>
      api.updateAttendance({
        studentId: vars.id,
        status: vars.status,
        date,
      }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousStudents = queryClient.getQueryData<Student[]>(queryKey) || [];

      const now = new Date().toLocaleTimeString(vars.locale === 'fa' ? 'fa-IR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      queryClient.setQueryData<Student[]>(queryKey, (old = []) =>
        old.map((student) => {
          if (student.id !== vars.id && student.studentId !== vars.id) return student;
          return {
            ...student,
            status: vars.status,
            checkInTime:
              vars.status === 'present' || vars.status === 'late'
                ? student.checkInTime || now
                : undefined,
          };
        })
      );

      return { previousStudents };
    },
    onError: (err, _vars, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(queryKey, context.previousStudents);
      }
      toast.error('خطا در ذخیره وضعیت / Error saving status', {
        description: err instanceof Error ? err.message : 'Failed to update attendance',
      });
    },
    onSuccess: (_, vars) => {
      const statusLabels: Record<AttendanceStatus, string> = {
        present: 'حاضر',
        absent: 'غایب',
        late: 'با تاخیر',
        justified: 'موجه',
      };
      toast.success(`وضعیت تغییر یافت: ${statusLabels[vars.status]}`, {
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  // 3. Mutation for creating a new student
  const addStudentMutation = useMutation({
    mutationFn: (newStudent: CreateStudentInput) => api.createStudent(newStudent),
    onSuccess: (created) => {
      toast.success(`دانش‌آموز «${created.nameFa}» با موفقیت اضافه شد`, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err) => {
      toast.error('خطا در ثبت دانش‌آموز جدید', {
        description: err instanceof Error ? err.message : 'Failed to create student',
      });
    },
  });

  // 4. Mutation for marking all present
  const markAllPresentMutation = useMutation({
    mutationFn: (vars?: { course?: string; locale?: string }) =>
      api.markAllPresent({
        date,
        course: vars?.course === 'all' ? undefined : vars?.course,
      }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousStudents = queryClient.getQueryData<Student[]>(queryKey) || [];

      const now = new Date().toLocaleTimeString(vars?.locale === 'fa' ? 'fa-IR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      queryClient.setQueryData<Student[]>(queryKey, (old = []) =>
        old.map((s) => {
          if (vars?.course && vars.course !== 'all' && s.course !== vars.course) return s;
          return {
            ...s,
            status: 'present' as AttendanceStatus,
            checkInTime: s.checkInTime || now,
          };
        })
      );

      return { previousStudents };
    },
    onError: (err, _vars, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(queryKey, context.previousStudents);
      }
      toast.error('خطا در تغییر وضعیت گروهی', {
        description: err instanceof Error ? err.message : 'Failed to mark all present',
      });
    },
    onSuccess: (res) => {
      toast.success(`تمام دانش‌آموزان (${res.updatedCount} نفر) حاضر شدند`, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const isSyncing =
    updateStatusMutation.isPending ||
    addStudentMutation.isPending ||
    markAllPresentMutation.isPending;

  const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : null;

  return {
    students,
    isLoading: isLoading || isFetching,
    isSyncing,
    error,
    updateStatus: (id: string, newStatus: AttendanceStatus, locale: string = 'fa') =>
      updateStatusMutation.mutateAsync({ id, status: newStatus, locale }),
    addStudent: (newStudent: CreateStudentInput) =>
      addStudentMutation.mutateAsync(newStudent),
    markAllPresent: (selectedCourse: string = 'all', locale: string = 'fa') =>
      markAllPresentMutation.mutateAsync({ course: selectedCourse, locale }),
    refresh: () => refetch(),
  };
}
