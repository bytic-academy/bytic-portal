import type {
  StudentWithAttendance,
  CreateStudentInput,
  UpdateAttendanceInput,
  AttendanceStatsData,
} from '@/types/attendance';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data as T;
}

export const api = {
  async getStudents(params?: {
    date?: string;
    course?: string;
    search?: string;
  }): Promise<StudentWithAttendance[]> {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    if (params?.course && params.course !== 'all') searchParams.set('course', params.course);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const url = `/api/students${query ? `?${query}` : ''}`;
    return request<StudentWithAttendance[]>(url, { method: 'GET' });
  },

  async createStudent(payload: CreateStudentInput): Promise<StudentWithAttendance> {
    return request<StudentWithAttendance>('/api/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAttendance(payload: UpdateAttendanceInput): Promise<StudentWithAttendance> {
    return request<StudentWithAttendance>('/api/attendance', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async markAllPresent(payload?: {
    date?: string;
    course?: string;
  }): Promise<{ updatedCount: number }> {
    return request<{ updatedCount: number }>('/api/attendance/mark-all', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async getStats(params?: { date?: string; course?: string }): Promise<AttendanceStatsData> {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    if (params?.course && params.course !== 'all') searchParams.set('course', params.course);

    const query = searchParams.toString();
    const url = `/api/stats${query ? `?${query}` : ''}`;
    return request<AttendanceStatsData>(url, { method: 'GET' });
  },
};
