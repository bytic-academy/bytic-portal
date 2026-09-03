import { useState } from 'react';
import {
  useAttendanceSheet,
  useToggleAttendance,
  type AttendanceStudentEntry,
} from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Users,
  Check,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import {
  formatJalaliFull,
  formatLocalizedTime,
  toPersianDigits,
} from '@/lib/date';

interface AttendanceSheetPageProps {
  sessionId: string;
  onBack: () => void;
}

export function AttendanceSheetPage({
  sessionId,
  onBack,
}: AttendanceSheetPageProps) {
  const { data: sheet, isLoading } = useAttendanceSheet(sessionId);
  const toggleMutation = useToggleAttendance();
  const [togglingStudentId, setTogglingStudentId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-muted-foreground">در حال بارگذاری لیست حضور و غیاب...</div>;
  }

  if (!sheet) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-destructive">اطلاعات جلسه یافت نشد یا دسترسی ندارید.</p>
        <Button variant="outline" size="sm" onClick={onBack}>بازگشت</Button>
      </div>
    );
  }

  const handleToggle = async (student: AttendanceStudentEntry) => {
    setTogglingStudentId(student.id);
    const nextStatus = !student.present;

    try {
      await toggleMutation.mutateAsync({
        sessionId,
        studentId: student.id,
        present: nextStatus,
      });
      toast.success(
        nextStatus
          ? `${student.name} به عنوان حاضر ثبت شد`
          : `وضعیت ${student.name} به غایب تغییر کرد`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    } finally {
      setTogglingStudentId(null);
    }
  };

  const handleMarkAll = async (present: boolean) => {
    try {
      for (const student of sheet.students) {
        if (student.present !== present) {
          await toggleMutation.mutateAsync({
            sessionId,
            studentId: student.id,
            present,
          });
        }
      }
      toast.success(present ? 'همه به عنوان حاضر ثبت شدند' : 'وضعیت همه به غایب تغییر کرد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const attendancePercent =
    sheet.totalEnrolled > 0
      ? Math.round((sheet.presentCount / sheet.totalEnrolled) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Session Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">{sheet.session.class?.course?.name}</span>
              <span className="text-muted-foreground text-xs">/</span>
              <span className="text-xs font-medium text-foreground">{sheet.session.class?.name || 'کلاس'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground mt-0.5 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span>{m.btn_attendance()}</span>
            </h1>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll(true)}
            disabled={toggleMutation.isPending}
            className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <CheckCircle2 className="h-3.5 w-3.5 me-1" />
            <span>حاضر زدن همه</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll(false)}
            disabled={toggleMutation.isPending}
            className="text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
          >
            <XCircle className="h-3.5 w-3.5 me-1" />
            <span>غایب زدن همه</span>
          </Button>
        </div>
      </div>

      {/* Session Metadata & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground block">تاریخ جلسه</span>
              <span className="text-sm font-bold text-foreground">{formatJalaliFull(sheet.session.date)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-sky-500" />
            <div>
              <span className="text-xs text-muted-foreground block">ساعت برگزاری</span>
              <span className="text-sm font-bold text-foreground">
                {formatLocalizedTime(sheet.session.startTime)} تا {formatLocalizedTime(sheet.session.endTime)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-indigo-500" />
            <div>
              <span className="text-xs text-muted-foreground block">آمار حضور</span>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="text-emerald-500">{toPersianDigits(sheet.presentCount)} حاضر</span>
                <span>/</span>
                <span className="text-rose-500">{toPersianDigits(sheet.absentCount)} غایب</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5 text-amber-500" />
            <div>
              <span className="text-xs text-muted-foreground block">درصد مشارکت</span>
              <span className="text-sm font-bold text-foreground">{toPersianDigits(attendancePercent)}٪</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Students Attendance List */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">لیست دانش‌آموزان کلاس</CardTitle>
            <span className="text-xs text-muted-foreground">
              برای تغییر وضعیت، روی دکمه یا کارت دانش‌آموز کلیک کنید
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {sheet.students.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              هیچ دانش‌آموزی در این کلاس ثبت‌نام نشده است. ابتدا از بخش کلاس، دانش‌آموزان را اضافه کنید.
            </div>
          ) : (
            sheet.students.map((student, index) => {
              const isToggling = togglingStudentId === student.id;
              const formattedTime = student.checkedAt
                ? formatLocalizedTime(
                    new Date(student.checkedAt).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  )
                : null;

              return (
                <div
                  key={student.id}
                  onClick={() => !isToggling && handleToggle(student)}
                  className={`p-4 flex items-center justify-between transition-colors cursor-pointer hover:bg-muted/50 ${
                    student.present ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                      {toPersianDigits(index + 1)}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.gender && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-normal">
                            {student.gender === 'MALE' ? 'پسر' : 'دختر'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formattedTime ? `آخرین ثبت: ساعت ${formattedTime}` : 'وضعیت: ثبت‌نشده (پیش‌فرض غایب)'}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button / Status Indicator */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={student.present ? 'default' : 'secondary'}
                      className={`text-xs px-2.5 py-1 transition-all ${
                        student.present
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {student.present ? (
                        <span className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>{m.status_present()}</span>
                        </span>
                      ) : (
                        <span>{m.status_absent()}</span>
                      )}
                    </Badge>

                    <Button
                      size="sm"
                      variant={student.present ? 'default' : 'outline'}
                      disabled={isToggling}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(student);
                      }}
                      className={`h-9 w-9 p-0 rounded-full transition-all ${
                        student.present
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                          : 'border-2 hover:border-emerald-500 text-muted-foreground hover:text-emerald-500'
                      }`}
                    >
                      <Check className={`h-4 w-4 ${student.present ? 'stroke-[3]' : ''}`} />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
