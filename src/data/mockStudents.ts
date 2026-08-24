export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified';

export type CourseType = 'scratch_jr' | 'scratch' | 'web_design' | 'python';

export interface Student {
  id: string;
  nameFa: string;
  nameEn: string;
  studentId: string;
  course: CourseType;
  guardianPhone: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  avatarUrl?: string;
}

export const initialStudents: Student[] = [
  {
    id: '1',
    nameFa: 'آراد رضایی',
    nameEn: 'Arad Rezaei',
    studentId: 'BYT-1042',
    course: 'scratch_jr',
    guardianPhone: '09121234567',
    checkInTime: '09:05',
    status: 'present',
  },
  {
    id: '2',
    nameFa: 'الینا محمدی',
    nameEn: 'Elina Mohammadi',
    studentId: 'BYT-1043',
    course: 'scratch_jr',
    guardianPhone: '09129876543',
    checkInTime: '09:00',
    status: 'present',
  },
  {
    id: '3',
    nameFa: 'کیان خسروی',
    nameEn: 'Kian Khosravi',
    studentId: 'BYT-1044',
    course: 'scratch',
    guardianPhone: '09351112233',
    checkInTime: '09:32',
    status: 'late',
  },
  {
    id: '4',
    nameFa: 'سوفیا ابراهیمی',
    nameEn: 'Sofia Ebrahimi',
    studentId: 'BYT-1045',
    course: 'web_design',
    guardianPhone: '09194445566',
    status: 'absent',
  },
  {
    id: '5',
    nameFa: 'بردیا تهرانی',
    nameEn: 'Bardia Tehrani',
    studentId: 'BYT-1046',
    course: 'python',
    guardianPhone: '09187778899',
    checkInTime: '08:55',
    status: 'present',
  },
  {
    id: '6',
    nameFa: 'دلارام صالحی',
    nameEn: 'Delaram Salehi',
    studentId: 'BYT-1047',
    course: 'scratch',
    guardianPhone: '09363334455',
    status: 'justified',
  },
  {
    id: '7',
    nameFa: 'سامان فراهانی',
    nameEn: 'Saman Farahani',
    studentId: 'BYT-1048',
    course: 'web_design',
    guardianPhone: '09125556677',
    checkInTime: '09:12',
    status: 'present',
  },
  {
    id: '8',
    nameFa: 'نیایش سعیدی',
    nameEn: 'Niayesh Saeedi',
    studentId: 'BYT-1049',
    course: 'python',
    guardianPhone: '09102223344',
    checkInTime: '09:40',
    status: 'late',
  },
];
