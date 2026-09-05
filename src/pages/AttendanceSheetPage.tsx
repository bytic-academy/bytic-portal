import { useState, useMemo } from 'react';
import {
  useAttendanceSheet,
  useToggleAttendance,
  type AttendanceStudentEntry,
} from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  Search,
  CheckCheck,
  Users,
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
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (sheet?.session?.classId) {
      navigate({ to: '/classes/$classId', params: { classId: sheet.session.classId } });
    } else {
      navigate({ to: '/classes' });
    }
  };

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

  const handleMarkAllPresent = async () => {
    if (!sheet || sheet.students.length === 0) return;
    const absents = sheet.students.filter((s) => !s.present);
    if (absents.length === 0) {
      toast.info('همه دانش‌آموزان از قبل به عنوان حاضر ثبت شده‌اند');
      return;
    }

    setIsMarkingAll(true);
    try {
      await Promise.all(
        absents.map((student) =>
          toggleMutation.mutateAsync({
            sessionId: effectiveSessionId,
            studentId: student.id,
            present: true,
          })
        )
      );
      toast.success(`${toPersianDigits(absents.length)} دانش‌آموز به عنوان حاضر ثبت شدند`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Filter students based on search input
  const filteredStudents = useMemo(() => {
    if (!sheet?.students) return [];
    if (!searchQuery.trim()) return sheet.students;
    const q = searchQuery.trim().toLowerCase();
    return sheet.students.filter((s) => s.name.toLowerCase().includes(q));
  }, [sheet?.students, searchQuery]);

  // Statistics
  const totalStudents = sheet?.students?.length || 0;
  const presentCount = sheet?.students?.filter((s) => s.present).length || 0;
  const absentCount = totalStudents - presentCount;
  const presentPercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Session Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="h-10 w-10 sm:h-9 sm:w-9 p-0 shrink-0"
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
            <h1 className="text-lg sm:text-xl font-bold text-foreground mt-0.5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span>{m.btn_attendance()}</span>
            </h1>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              {formatJalaliFull(sheet.session.date)} • ساعت {formatLocalizedTime(sheet.session.startTime)} تا {formatLocalizedTime(sheet.session.endTime)}
            </div>
          </div>
        </div>

        {/* Quick Bulk Action */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={isMarkingAll || totalStudents === 0 || absentCount === 0}
            className="w-full sm:w-auto h-9 font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{isMarkingAll ? 'در حال ثبت...' : m.mark_all_present()}</span>
          </Button>
        </div>
      </div>

      {/* Live Ratio & Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-xl bg-card border border-border/60 text-center space-y-0.5">
          <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
            <Users className="h-3 w-3" />
            <span>کل دانش‌آموزان</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {toPersianDigits(totalStudents)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
            <Check className="h-3 w-3" />
            <span>{m.stats_present_count()}</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {toPersianDigits(presentCount)} <span className="text-xs font-normal opacity-80">({toPersianDigits(presentPercentage)}٪)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center space-y-0.5">
          <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
            <X className="h-3 w-3" />
            <span>{m.stats_absent_count()}</span>
          </div>
          <div className="text-lg font-bold text-muted-foreground">
            {toPersianDigits(absentCount)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={m.search_student()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9 pe-8 h-10 text-xs bg-card"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Students Attendance List */}
      <Card className="shadow-2xs overflow-hidden border-border/70">
        <CardHeader className="py-2.5 px-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-bold">
              لیست دانش‌آموزان ({toPersianDigits(filteredStudents.length)})
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">
              روی هر ردیف کلیک کنید تا وضعیت تغییر کند
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/60">
          {totalStudents === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              هیچ دانش‌آموزی در این کلاس ثبت‌نام نشده است.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              دانش‌آموزی با عبارت «{searchQuery}» پیدا نشد.
            </div>
          ) : (
            filteredStudents.map((student, index) => {
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
                  onClick={() => !isToggling && !isMarkingAll && handleToggle(student)}
                  className={`px-3.5 py-3 min-h-[52px] flex items-center justify-between gap-3 transition-colors cursor-pointer select-none active:bg-muted/70 hover:bg-muted/30 ${
                    student.present ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-center shrink-0">
                      {toPersianDigits(index + 1)}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 truncate">
                        <span className="truncate">{student.name}</span>
                        {student.gender && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal shrink-0">
                            {student.gender === 'MALE' ? 'پسر' : 'دختر'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {formattedTime ? `ثبت ساعت ${formattedTime}` : 'ثبت‌نشده (پیش‌فرض غایب)'}
                      </div>
                    </div>
                  </div>

                  {/* Clean Status Indicator Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isToggling || isMarkingAll}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(student);
                      }}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                        student.present
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                          : 'bg-muted/80 hover:bg-muted text-muted-foreground border border-border/80 active:scale-95'
                      }`}
                    >
                      {student.present ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{m.status_present()}</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 opacity-60" />
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
