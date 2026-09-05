import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses, useClasses, useStudents, type SessionEntity } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  School,
  Users,
  CalendarCheck,
  Calendar,
  ArrowUpLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import {
  getJalaliTodayDetails,
  getTodayISO,
  formatLocalizedTime,
  toPersianDigits,
} from '@/lib/date';

interface DashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const todayDetails = getJalaliTodayDetails();
  const todayISO = getTodayISO();

  const totalSessions = classes.reduce((sum, c) => sum + (c._count?.sessions || 0), 0);

  // Extract sessions scheduled for today across all accessible classes
  const todaySessions = useMemo(() => {
    const list: { session: SessionEntity; class: (typeof classes)[0] }[] = [];
    for (const cls of classes) {
      if (cls.sessions) {
        for (const s of cls.sessions) {
          if (s.date === todayISO) {
            list.push({ session: s, class: cls });
          }
        }
      }
    }
    return list;
  }, [classes, todayISO]);

  const pendingTodaySessions = todaySessions.filter(
    (item) => (item.session._count?.attendance || 0) === 0
  );

  return (
    <div className="space-y-5">
      {/* Calm, Modern Header & Date Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            سلام، {user?.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAdmin ? 'مدیریت و نظارت کلی بر سیستم حضور و غیاب بایتک' : 'جلسات و حضور و غیاب کلاس‌های اختصاصی شما'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 border border-border/60 px-3 py-1.5 text-xs text-muted-foreground self-start sm:self-auto">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>امروز: {todayDetails.fullFormatted}</span>
        </div>
      </div>

      {/* ─── TODAY'S ACTION SECTION (HIGHEST PRIORITY) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>{m.today_schedule()}</span>
            {todaySessions.length > 0 && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                {toPersianDigits(todaySessions.length)} جلسه
              </Badge>
            )}
            {pendingTodaySessions.length > 0 && (
              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 hover:bg-amber-600 text-white">
                {toPersianDigits(pendingTodaySessions.length)} نیازمند ثبت
              </Badge>
            )}
          </h2>
        </div>

        {todaySessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 opacity-60" />
              <span>{m.no_sessions_today()} ({todayDetails.fullFormatted})</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaySessions.map(({ session, class: cls }) => {
              const isRecorded = (session._count?.attendance || 0) > 0;
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isRecorded
                      ? 'bg-card border-border/70'
                      : 'bg-amber-500/5 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-sm text-foreground truncate">
                          {cls.name || 'کلاس عمومی'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {cls.course?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatLocalizedTime(session.startTime)} تا {formatLocalizedTime(session.endTime)}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={isRecorded ? 'outline' : 'default'}
                      className={`text-[10px] shrink-0 ${
                        isRecorded
                          ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {isRecorded ? m.attendance_recorded() : m.attendance_pending()}
                    </Badge>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {isRecorded
                        ? `${toPersianDigits(session._count?.attendance || 0)} رکورد ثبت شده`
                        : 'هنوز حضور و غیاب این جلسه انجام نشده'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: '/sessions/$sessionId/attendance',
                          params: { sessionId: session.id },
                        })
                      }
                      className={`text-xs font-bold h-8 px-3 ${
                        isRecorded
                          ? 'variant-outline'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                      <span>{m.btn_attendance()}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MINIMAL STAT METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card className="shadow-2xs border-border/60">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {m.nav_courses()}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {toPersianDigits(courses.length)}
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/60">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {isAdmin ? 'تمام کلاس‌ها' : 'کلاس‌های من'}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {toPersianDigits(classes.length)}
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
              <School className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/60">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {m.nav_students()}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {toPersianDigits(students.length)}
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/60">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                جلسات ثبت‌شده
              </span>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {toPersianDigits(totalSessions)}
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
              <CalendarCheck className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ACTIVE CLASSES SECTION ─── */}
      <Card className="shadow-2xs border-border/60">
        <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
            <span>کلاس‌های فعال شما</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onNavigate?.('classes');
              navigate({ to: '/classes' });
            }}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <span>مشاهده همه کلاس‌ها</span>
            <ArrowUpLeft className="h-3.5 w-3.5 ms-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {classes.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              هنوز کلاسی به شما اختصاص داده نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {classes.slice(0, 6).map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => {
                    onNavigate?.('classes');
                    navigate({ to: '/classes/$classId', params: { classId: cls.id } });
                  }}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/40 transition-colors cursor-pointer space-y-1.5 group select-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate">
                      {cls.name || 'کلاس بدون نام'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-card text-muted-foreground border border-border/40 shrink-0">
                      {cls.course?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                    <span>{toPersianDigits(cls._count?.students || 0)} دانش‌آموز</span>
                    <span>{toPersianDigits(cls._count?.sessions || 0)} جلسه</span>
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
