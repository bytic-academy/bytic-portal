import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useClass,
  useStudents,
  useUsers,
  useEnrollStudent,
  useUnenrollStudent,
  useAssignTeacher,
  useRemoveTeacher,
  useCreateSession,
  useBulkCreateSessions,
  useDeleteSession,
} from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JalaliMultiDatePicker } from '@/components/JalaliMultiDatePicker';
import { JalaliDatePicker } from '@/components/JalaliDatePicker';
import {
  formatJalaliMedium,
  formatLocalizedTime,
  getTodayISO,
  toPersianDigits,
} from '@/lib/date';
import {
  ArrowRight,
  Users,
  CalendarCheck,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';

interface ClassDetailPageProps {
  classId?: string;
  onBack?: () => void;
  onTakeAttendance?: (sessionId: string) => void;
}

export function ClassDetailPage({
  classId,
  onBack,
  onTakeAttendance,
}: ClassDetailPageProps = {}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const effectiveClassId = classId || (params as { classId?: string })?.classId || '';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: '/classes' });
    }
  };

  const handleTakeAttendance = (sessionId: string) => {
    if (onTakeAttendance) {
      onTakeAttendance(sessionId);
    } else {
      navigate({
        to: '/sessions/$sessionId/attendance',
        params: { sessionId },
      });
    }
  };

  const { isAdmin } = useAuth();
  const { data: cls, isLoading } = useClass(effectiveClassId);
  const { data: allStudents = [] } = useStudents();
  const { data: allUsers = [] } = useUsers();

  const enrollMutation = useEnrollStudent();
  const unenrollMutation = useUnenrollStudent();
  const assignTeacherMutation = useAssignTeacher();
  const removeTeacherMutation = useRemoveTeacher();
  const createSessionMutation = useCreateSession();
  const bulkCreateMutation = useBulkCreateSessions();
  const deleteSessionMutation = useDeleteSession();

  // Modals state
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionMode, setSessionMode] = useState<'single' | 'bulk'>('single');
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);

  // Form states
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [singleDate, setSingleDate] = useState(getTodayISO);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [studentToEnroll, setStudentToEnroll] = useState('');
  const [teacherToAssign, setTeacherToAssign] = useState('');

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-muted-foreground">در حال بارگذاری جزئیات کلاس...</div>;
  }

  if (!cls) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-destructive">کلاس یافت نشد یا دسترسی ندارید.</p>
        <Button variant="outline" size="sm" onClick={handleBack}>بازگشت</Button>
      </div>
    );
  }

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      toast.error('زمان پایان باید بعد از زمان شروع باشد');
      return;
    }

    if (sessionMode === 'single') {
      if (!singleDate) {
        toast.error('تاریخ جلسه را وارد کنید');
        return;
      }
      try {
        await createSessionMutation.mutateAsync({
          classId: effectiveClassId,
          date: singleDate,
          startTime,
          endTime,
        });
        toast.success('جلسه جدید ایجاد شد');
        setIsAddSessionOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : m.msg_error());
      }
    } else {
      if (bulkDates.length === 0) {
        toast.error('لطفا حداقل یک تاریخ برای جلسات انتخاب کنید');
        return;
      }
      try {
        await bulkCreateMutation.mutateAsync({
          classId: effectiveClassId,
          dates: bulkDates,
          startTime,
          endTime,
        });
        toast.success(`${toPersianDigits(bulkDates.length)} جلسه با موفقیت ایجاد شد`);
        setIsAddSessionOpen(false);
        setBulkDates([]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : m.msg_error());
      }
    }
  };

  const handleEnroll = async () => {
    if (!studentToEnroll) return;
    try {
      await enrollMutation.mutateAsync({ classId: effectiveClassId, studentId: studentToEnroll });
      toast.success('دانش‌آموز به کلاس اضافه شد');
      setIsEnrollOpen(false);
      setStudentToEnroll('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleUnenroll = async (studentId: string, studentName: string) => {
    if (!confirm(`آیا از حذف دانش‌آموز "${studentName}" از این کلاس اطمینان دارید؟`)) return;
    try {
      await unenrollMutation.mutateAsync({ classId: effectiveClassId, studentId });
      toast.success('دانش‌آموز از کلاس حذف شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleAssignTeacher = async () => {
    if (!teacherToAssign) return;
    try {
      await assignTeacherMutation.mutateAsync({ classId: effectiveClassId, userId: teacherToAssign });
      toast.success('استاد به کلاس اضافه شد');
      setIsAssignTeacherOpen(false);
      setTeacherToAssign('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleRemoveTeacher = async (userId: string, teacherName: string) => {
    if (!confirm(`آیا از حذف استاد "${teacherName}" از این کلاس اطمینان دارید؟`)) return;
    try {
      await removeTeacherMutation.mutateAsync({ classId: effectiveClassId, userId });
      toast.success('استاد از کلاس حذف شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleDeleteSession = async (sessionId: string, date: string) => {
    const formattedDate = formatJalaliMedium(date);
    if (!confirm(`آیا از حذف جلسه تاریخ ${formattedDate} اطمینان دارید؟ تمام رکوردهای حضور و غیاب آن نیز حذف خواهد شد.`)) return;
    try {
      await deleteSessionMutation.mutateAsync({ classId: effectiveClassId, sessionId });
      toast.success('جلسه با موفقیت حذف شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const enrolledStudentIds = new Set(cls.students?.map((s) => s.student.id) || []);
  const availableStudents = allStudents.filter((s) => !enrolledStudentIds.has(s.id));

  const assignedTeacherIds = new Set(cls.teachers?.map((t) => t.user.id) || []);
  const availableTeachers = allUsers.filter((u) => !assignedTeacherIds.has(u.id));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="sm" onClick={handleBack} className="h-9 w-9 p-0 shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-primary truncate">{cls.course?.name}</span>
              <span className="text-muted-foreground text-xs">/</span>
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {cls.name || 'کلاس عمومی'}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              اساتید: {cls.teachers?.map((t) => t.user.name).join('، ') || 'بدون استاد'}
            </p>
          </div>
        </div>

        {/* Quick Add Session Action */}
        <Button
          onClick={() => setIsAddSessionOpen(true)}
          className="font-bold gap-1.5 bg-primary text-primary-foreground text-xs w-full sm:w-auto h-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{m.add_sessions()}</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:max-w-md h-auto p-1 bg-muted/60">
          <TabsTrigger value="sessions" className="gap-1.5 py-2 px-1 sm:px-3 text-xs font-semibold">
            <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
            <span>جلسات ({toPersianDigits(cls.sessions?.length || 0)})</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-1.5 py-2 px-1 sm:px-3 text-xs font-semibold">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>دانش‌آموزان ({toPersianDigits(cls.students?.length || 0)})</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-1.5 py-2 px-1 sm:px-3 text-xs font-semibold">
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span>اساتید ({toPersianDigits(cls.teachers?.length || 0)})</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: SESSIONS ─── */}
        <TabsContent value="sessions" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>فهرست جلسات کلاس ({toPersianDigits(cls.sessions?.length || 0)})</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddSessionOpen(true)}
              className="text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{m.add_sessions()}</span>
            </Button>
          </div>

          {cls.sessions?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-3">
                <CalendarCheck className="h-9 w-9 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">هنوز جلسه‌ای برای این کلاس تعریف نشده است.</p>
                <Button size="sm" onClick={() => setIsAddSessionOpen(true)}>
                  افزودن جلسه با تقویم شمسی
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xs overflow-hidden border-border/70">
              <div className="divide-y divide-border/60">
                {cls.sessions?.map((session, index) => {
                  const attendanceCount = session._count?.attendance || 0;
                  const isRecorded = attendanceCount > 0;
                  return (
                    <div
                      key={session.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-muted text-muted-foreground shrink-0">
                          {toPersianDigits(index + 1)}
                        </span>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                            <span>{formatJalaliMedium(session.date)}</span>
                            <Badge
                              variant={isRecorded ? 'outline' : 'secondary'}
                              className={`text-[10px] py-0 px-1.5 font-normal ${
                                isRecorded
                                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isRecorded
                                ? `${m.attendance_recorded()} (${toPersianDigits(attendanceCount)})`
                                : m.attendance_pending()}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            ساعت {formatLocalizedTime(session.startTime)} تا {formatLocalizedTime(session.endTime)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleTakeAttendance(session.id)}
                          className={`text-xs font-bold gap-1.5 h-8 px-3 ${
                            isRecorded
                              ? 'variant-outline bg-muted/60 text-foreground hover:bg-muted'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{m.btn_attendance()}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSession(session.id, session.date)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="حذف جلسه"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ─── TAB 2: STUDENTS ─── */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>دانش‌آموزان ثبت‌نام‌شده در این کلاس</span>
            </h3>
            <Button
              size="sm"
              onClick={() => setIsEnrollOpen(true)}
              className="text-xs gap-1.5 w-full sm:w-auto h-10 sm:h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ثبت‌نام دانش‌آموز جدید در کلاس</span>
            </Button>
          </div>

          {cls.students?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <Users className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">هنوز دانش‌آموزی در این کلاس ثبت‌نام نشده است.</p>
                <Button size="sm" variant="outline" onClick={() => setIsEnrollOpen(true)} className="w-full sm:w-auto h-10 sm:h-8">
                  افزودن دانش‌آموز
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cls.students?.map(({ student }) => (
                <Card key={student.id} className="p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-foreground">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.gender === 'MALE' ? 'پسر' : student.gender === 'FEMALE' ? 'دختر' : ''}
                        {student.birthdate ? ` • متولد ${formatJalaliMedium(student.birthdate)}` : ''}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnenroll(student.id, student.name)}
                      className="h-9 px-2.5 sm:h-8 sm:px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 me-1" />
                      <span>حذف</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 3: TEACHERS ─── */}
        <TabsContent value="teachers" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary shrink-0" />
              <span>اساتید مسئول این کلاس</span>
            </h3>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setIsAssignTeacherOpen(true)}
                className="text-xs gap-1.5 w-full sm:w-auto h-10 sm:h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>تخصیص استاد جدید</span>
              </Button>
            )}
          </div>

          {cls.teachers?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <UserCheck className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">هیچ استادی برای این کلاس ثبت نشده است.</p>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setIsAssignTeacherOpen(true)}>
                    تخصیص استاد
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cls.teachers?.map(({ user }) => (
                <Card key={user.id} className="p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTeacher(user.id, user.name)}
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 me-1" />
                        <span>حذف</span>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── UNIFIED ADD SESSIONS MODAL ─── */}
      <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateSessionSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{m.add_sessions()}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSessionMode('single')}
                  className={`py-1.5 rounded-md transition-all ${
                    sessionMode === 'single'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.single_session_mode()}
                </button>
                <button
                  type="button"
                  onClick={() => setSessionMode('bulk')}
                  className={`py-1.5 rounded-md transition-all ${
                    sessionMode === 'bulk'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.bulk_session_mode()}
                </button>
              </div>

              {/* Date Selection */}
              {sessionMode === 'single' ? (
                <JalaliDatePicker
                  id="singleSessionDate"
                  label="تاریخ جلسه *"
                  value={singleDate}
                  onChange={setSingleDate}
                  required
                />
              ) : (
                <JalaliMultiDatePicker
                  value={bulkDates}
                  onChange={setBulkDates}
                  label="انتخاب تاریخ‌ها روی تقویم شمسی *"
                />
              )}

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="sessionStartTime" className="text-xs font-semibold">
                    ساعت شروع *
                  </Label>
                  <Input
                    id="sessionStartTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sessionEndTime" className="text-xs font-semibold">
                    ساعت پایان *
                  </Label>
                  <Input
                    id="sessionEndTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsAddSessionOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button
                type="submit"
                disabled={
                  sessionMode === 'single'
                    ? createSessionMutation.isPending
                    : bulkCreateMutation.isPending || bulkDates.length === 0
                }
                className="bg-primary text-primary-foreground font-bold"
              >
                {sessionMode === 'single'
                  ? createSessionMutation.isPending ? 'در حال ایجاد...' : m.btn_save()
                  : bulkCreateMutation.isPending ? 'در حال ایجاد...' : `ایجاد ${toPersianDigits(bulkDates.length)} جلسه`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── ENROLL STUDENT MODAL ─── */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">ثبت‌نام دانش‌آموز در کلاس</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">انتخاب دانش‌آموز</Label>
              <Select value={studentToEnroll} onValueChange={setStudentToEnroll}>
                <SelectTrigger>
                  <SelectValue placeholder="یک دانش‌آموز را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.birthdate ? `(${formatJalaliMedium(s.birthdate)})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsEnrollOpen(false)}>
              {m.btn_cancel()}
            </Button>
            <Button
              type="button"
              disabled={!studentToEnroll || enrollMutation.isPending}
              onClick={handleEnroll}
            >
              ثبت‌نام در کلاس
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ASSIGN TEACHER MODAL ─── */}
      <Dialog open={isAssignTeacherOpen} onOpenChange={setIsAssignTeacherOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">تخصیص استاد به کلاس</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">انتخاب استاد</Label>
              <Select value={teacherToAssign} onValueChange={setTeacherToAssign}>
                <SelectTrigger>
                  <SelectValue placeholder="یک کاربر را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email} - {u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsAssignTeacherOpen(false)}>
              {m.btn_cancel()}
            </Button>
            <Button
              type="button"
              disabled={!teacherToAssign || assignTeacherMutation.isPending}
              onClick={handleAssignTeacher}
            >
              تخصیص استاد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
