import { useAuth } from '@/hooks/useAuth';
import { useCourses, useClasses, useStudents } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  School,
  Users,
  CalendarCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { m } from '@/paraglide/messages';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, isAdmin } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();

  const totalSessions = classes.reduce((sum, c) => sum + (c._count?.sessions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bytic-navy)] via-[#152e47] to-[var(--bytic-surface)] p-6 sm:p-8 text-white shadow-lg border border-primary/20">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[var(--bytic-green)]" />
            <span>خوش آمدید، {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {m.welcome_title()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {m.welcome_desc()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                {m.nav_courses()}
              </span>
              <div className="text-2xl font-black text-foreground">
                {courses.length}
              </div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                {isAdmin ? 'تمام کلاس‌ها' : 'کلاس‌های من'}
              </span>
              <div className="text-2xl font-black text-foreground">
                {classes.length}
              </div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <School className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                {m.nav_students()}
              </span>
              <div className="text-2xl font-black text-foreground">
                {students.length}
              </div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">
                جلسات ثبت‌شده
              </span>
              <div className="text-2xl font-black text-foreground">
                {totalSessions}
              </div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            <span>کلاس‌های فعال شما</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('classes')}
            className="text-xs"
          >
            <span>مشاهده همه کلاس‌ها</span>
            <ArrowUpRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              هنوز کلاسی ثبت یا به شما اختصاص داده نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.slice(0, 6).map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => onNavigate('classes')}
                  className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-all cursor-pointer space-y-2 group shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {cls.name || 'کلاس بدون نام'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {cls.course?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{cls._count?.students || 0} دانش‌آموز</span>
                    <span>{cls._count?.sessions || 0} جلسه</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
