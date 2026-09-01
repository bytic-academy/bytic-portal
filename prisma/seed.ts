import { prisma } from '../api/_lib/prisma';

const initialStudents = [
  {
    nameFa: 'آراد رضایی',
    nameEn: 'Arad Rezaei',
    studentId: 'BYT-1042',
    course: 'scratch_jr',
    guardianPhone: '09121234567',
    checkInTime: '09:05',
    status: 'present',
  },
  {
    nameFa: 'الینا محمدی',
    nameEn: 'Elina Mohammadi',
    studentId: 'BYT-1043',
    course: 'scratch_jr',
    guardianPhone: '09129876543',
    checkInTime: '09:00',
    status: 'present',
  },
  {
    nameFa: 'کیان خسروی',
    nameEn: 'Kian Khosravi',
    studentId: 'BYT-1044',
    course: 'scratch',
    guardianPhone: '09351112233',
    checkInTime: '09:32',
    status: 'late',
  },
  {
    nameFa: 'سوفیا ابراهیمی',
    nameEn: 'Sofia Ebrahimi',
    studentId: 'BYT-1045',
    course: 'web_design',
    guardianPhone: '09194445566',
    checkInTime: undefined,
    status: 'absent',
  },
  {
    nameFa: 'بردیا تهرانی',
    nameEn: 'Bardia Tehrani',
    studentId: 'BYT-1046',
    course: 'python',
    guardianPhone: '09187778899',
    checkInTime: '08:55',
    status: 'present',
  },
  {
    nameFa: 'دلارام صالحی',
    nameEn: 'Delaram Salehi',
    studentId: 'BYT-1047',
    course: 'scratch',
    guardianPhone: '09363334455',
    checkInTime: undefined,
    status: 'justified',
  },
  {
    nameFa: 'سامان فراهانی',
    nameEn: 'Saman Farahani',
    studentId: 'BYT-1048',
    course: 'web_design',
    guardianPhone: '09125556677',
    checkInTime: '09:12',
    status: 'present',
  },
  {
    nameFa: 'نیایش سعیدی',
    nameEn: 'Niayesh Saeedi',
    studentId: 'BYT-1049',
    course: 'python',
    guardianPhone: '09102223344',
    checkInTime: '09:40',
    status: 'late',
  },
];

async function main() {
  console.log('Seeding Bytic students data...');
  const today = new Date().toISOString().slice(0, 10);

  for (const s of initialStudents) {
    const student = await prisma.student.upsert({
      where: { studentId: s.studentId },
      update: {
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        course: s.course,
        guardianPhone: s.guardianPhone,
      },
      create: {
        studentId: s.studentId,
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        course: s.course,
        guardianPhone: s.guardianPhone,
      },
    });

    await prisma.attendanceRecord.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today,
        },
      },
      update: {
        status: s.status,
        checkInTime: s.checkInTime || null,
      },
      create: {
        studentId: student.id,
        date: today,
        status: s.status,
        checkInTime: s.checkInTime || null,
      },
    });
  }

  console.log('✓ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
