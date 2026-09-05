import { useState } from 'react';
import {
  useAttendanceSheet,
  useToggleAttendance,
  type AttendanceStudentEntry,
} from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import {
  formatJalaliFull,
  formatLocalizedTime,
  toPersianDigits,
} from '@/lib/date';

interface AttendanceSheetPageProps {
  sessionId?: string;
  onBack?: () => void;
}

export function AttendanceSheetPage({
  sessionId,
  onBack,
}: AttendanceSheetPageProps = {}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const effectiveSessionId = sessionId || (params as { sessionId?: string })?.sessionId || '';

  const { data: sheet, isLoading } = useAttendanceSheet(effectiveSessionId);
  const toggleMutation = useToggleAttendance();
  const [togglingStudentId, setTogglingStudentId] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (sheet?.session?.classId) {
      navigate({ to: '/classes/$classId', params: { classId: sheet.session.classId } });
    } else {
      navigate({ to: '/classes' });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-muted-foreground">در حال بارگذاری لیست حضور و غیاب...</div>;
  }

  if (!sheet) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-destructive">اطلاعات جلسه یافت نشد یا دسترسی ندارید.</p>
        <Button variant="outline" size="sm" onClick={handleBack}>بازگشت</Button>
      </div>
    );
  }

  const handleToggle = async (student: AttendanceStudentEntry) => {
    setTogglingStudentId(student.id);
    const nextStatus = !student.present;

    try {
      await toggleMutation.mutateAsync({
        sessionId: effectiveSessionId,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Session Info */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-11 w-11 sm:h-9 sm:w-9 p-0 shrink-0"
          aria-label="Back"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span className="font-semibold text-primary">{sheet.session.class?.course?.name}</span>
            <span>/</span>
            <span className="font-medium text-foreground">{sheet.session.class?.name || 'کلاس'}</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-foreground mt-0.5 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <span>{m.btn_attendance()}</span>
          </h1>
          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
            {formatJalaliFull(sheet.session.date)} • ساعت {formatLocalizedTime(sheet.session.startTime)} تا {formatLocalizedTime(sheet.session.endTime)}
          </div>
        </div>
      </div>

      {/* Students Attendance List */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="py-3.5 px-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold">لیست دانش‌آموزان ({toPersianDigits(sheet.students.length)})</CardTitle>
            <span className="text-[11px] text-muted-foreground">
              برای تغییر وضعیت، روی ردیف کلیک کنید
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
                  className={`p-3.5 sm:p-4 min-h-[58px] flex items-center justify-between gap-3 transition-colors cursor-pointer select-none active:bg-muted/70 hover:bg-muted/40 ${
                    student.present ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-center shrink-0">
                      {toPersianDigits(index + 1)}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-bold text-foreground flex items-center gap-2 truncate">
                        <span className="truncate">{student.name}</span>
                        {student.gender && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-normal shrink-0">
                            {student.gender === 'MALE' ? 'پسر' : 'دختر'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {formattedTime ? `ثبت: ساعت ${formattedTime}` : 'وضعیت: ثبت‌نشده (پیش‌فرض غایب)'}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button / Status Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(student);
                      }}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                        student.present
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border/80 active:scale-95'
                      }`}
                    >
                      {student.present ? (
                        <>
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          <span>{m.status_present()}</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3.5 w-3.5 opacity-60" />
                          <span>{m.status_absent()}</span>
                        </>
                      )}
                    </button>
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
