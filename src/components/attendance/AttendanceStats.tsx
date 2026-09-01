import { Users, UserCheck, UserX, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { m } from '@/paraglide/messages';
import type { Student } from '@/types/attendance';

interface AttendanceStatsProps {
  students: Student[];
  isLoading?: boolean;
}

export function AttendanceStats({ students, isLoading = false }: AttendanceStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} className="border border-primary/10 bg-card/60">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="mt-3">
                <Skeleton className="h-7 w-12" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const total = students.length;
  const present = students.filter((s) => s.status === 'present').length;
  const absent = students.filter((s) => s.status === 'absent').length;
  const late = students.filter((s) => s.status === 'late').length;
  const justified = students.filter((s) => s.status === 'justified').length;
  const presentPercentage =
    total > 0 ? Math.round(((present + late + justified) / total) * 100) : 0;

  const stats = [
    {
      title: m.stat_total_students(),
      value: total,
      subtext: 'دانش‌آموز فعال / Active',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: m.stat_present_today(),
      value: present,
      subtext: `${total > 0 ? Math.round((present / total) * 100) : 0}% حاضر`,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: m.stat_absent_today(),
      value: absent,
      subtext: `${total > 0 ? Math.round((absent / total) * 100) : 0}% غیرحاضر`,
      icon: UserX,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      title: m.stat_late_today(),
      value: late,
      subtext: 'تاخیر ثبت‌شده',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: m.stat_attendance_rate(),
      value: `${presentPercentage}%`,
      subtext: 'مجموع حاضرین و تاخیر',
      icon: Activity,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className={`border ${stat.border} transition-all duration-200 hover:-translate-y-0.5`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
                  {stat.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-1">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                {stat.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
