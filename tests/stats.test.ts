import { describe, it, expect } from 'vitest';
import type { Student } from '../src/types/attendance';

function calculateStats(students: Student[]) {
  const total = students.length;
  const present = students.filter((s) => s.status === 'present').length;
  const absent = students.filter((s) => s.status === 'absent').length;
  const late = students.filter((s) => s.status === 'late').length;
  const justified = students.filter((s) => s.status === 'justified').length;
  const presentPercentage =
    total > 0 ? Math.round(((present + late + justified) / total) * 100) : 0;

  return {
    total,
    present,
    absent,
    late,
    justified,
    presentPercentage,
  };
}

describe('Attendance Statistics Calculations', () => {
  it('calculates 0% when no students exist', () => {
    const stats = calculateStats([]);
    expect(stats.total).toBe(0);
    expect(stats.presentPercentage).toBe(0);
  });

  it('calculates correct percentages with mixed statuses', () => {
    const students: Student[] = [
      {
        id: '1',
        studentId: 'BYT-1001',
        nameFa: 'علی',
        nameEn: 'Ali',
        course: 'scratch_jr',
        guardianPhone: '09121111111',
        status: 'present',
      },
      {
        id: '2',
        studentId: 'BYT-1002',
        nameFa: 'سارا',
        nameEn: 'Sara',
        course: 'scratch',
        guardianPhone: '09122222222',
        status: 'late',
      },
      {
        id: '3',
        studentId: 'BYT-1003',
        nameFa: 'رضا',
        nameEn: 'Reza',
        course: 'web_design',
        guardianPhone: '09123333333',
        status: 'justified',
      },
      {
        id: '4',
        studentId: 'BYT-1004',
        nameFa: 'مریم',
        nameEn: 'Maryam',
        course: 'python',
        guardianPhone: '09124444444',
        status: 'absent',
      },
    ];

    const stats = calculateStats(students);
    expect(stats.total).toBe(4);
    expect(stats.present).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.justified).toBe(1);
    expect(stats.absent).toBe(1);
    // (1 present + 1 late + 1 justified) / 4 = 75%
    expect(stats.presentPercentage).toBe(75);
  });
});
