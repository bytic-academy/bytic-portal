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
  Layers,
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
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSingleSessionOpen, setIsSingleSessionOpen] = useState(false);
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

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkDates.length === 0) {
      toast.error('لطفا حداقل یک تاریخ برای جلسات انتخاب کنید');
      return;
    }
    if (startTime >= endTime) {
      toast.error('زمان پایان باید بعد از زمان شروع باشد');
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
      setIsBulkOpen(false);
      setBulkDates([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleDate) {
      toast.error('تاریخ جلسه را وارد کنید');
      return;
    }
    if (startTime >= endTime) {
      toast.error('زمان پایان باید بعد از زمان شروع باشد');
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
      setIsSingleSessionOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-0 border-b sm:border-b-0 border-border/60">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack} className="h-11 w-11 sm:h-9 sm:w-9 p-0 shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-primary truncate">{cls.course?.name}</span>
              <span className="text-muted-foreground text-xs">/</span>
              <h1 className="text-lg sm:text-2xl font-black text-foreground truncate">
                {cls.name || 'کلاس عمومی'}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              اساتید: {cls.teachers?.map((t) => t.user.name).join('، ') || 'بدون استاد'}
            </p>
          </div>
        </div>

        {/* Quick Bulk Action */}
        <Button
          onClick={() => setIsBulkOpen(true)}
          className="font-bold gap-2 bg-[var(--bytic-green)] hover:bg-[var(--bytic-green)]/90 text-white w-full sm:w-auto h-11 sm:h-9 shrink-0"
        >
          <Layers className="h-4 w-4" />
          <span>{m.btn_bulk_sessions()}</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:max-w-md h-auto p-1">
          <TabsTrigger value="sessions" className="gap-1.5 py-2.5 sm:py-1.5 px-1 sm:px-3 text-xs font-semibold">
            <CalendarCheck className="h-4 w-4 shrink-0" />
            <span>جلسات ({toPersianDigits(cls.sessions?.length || 0)})</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-1.5 py-2.5 sm:py-1.5 px-1 sm:px-3 text-xs font-semibold">
            <Users className="h-4 w-4 shrink-0" />
            <span>دانش‌آموزان ({toPersianDigits(cls.students?.length || 0)})</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-1.5 py-2.5 sm:py-1.5 px-1 sm:px-3 text-xs font-semibold">
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>اساتید ({toPersianDigits(cls.teachers?.length || 0)})</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: SESSIONS ─── */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>فهرست جلسات برگزارشده یا برنامه‌ریزی‌شده</span>
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSingleSessionOpen(true)}
                className="text-xs gap-1.5 flex-1 sm:flex-initial h-10 sm:h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>جلسه تکی</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsBulkOpen(true)}
                className="text-xs gap-1.5 bg-primary flex-1 sm:flex-initial h-10 sm:h-8"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>چند جلسه همزمان</span>
              </Button>
            </div>
          </div>

          {cls.sessions?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">هنوز هیچ جلسه‌ای برای این کلاس ثبت نشده است.</p>
                <Button size="sm" onClick={() => setIsBulkOpen(true)}>
                  ایجاد جلسات با تقویم شمسی
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cls.sessions?.map((session, index) => (
                <Card key={session.id} className="hover:border-primary/40 transition-colors shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          <span>جلسه {toPersianDigits(index + 1)}</span>
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {formatJalaliMedium(session.date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ساعت: {formatLocalizedTime(session.startTime)} تا {formatLocalizedTime(session.endTime)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id, session.date)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <Button
                        onClick={() => handleTakeAttendance(session.id)}
                        className="w-full font-bold text-xs gap-1.5 bg-primary/90 hover:bg-primary text-primary-foreground h-11 sm:h-9"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{m.btn_attendance()}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

      {/* ─── BULK CREATE SESSIONS MODAL ─── */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleBulkCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <span>{m.btn_bulk_sessions()}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-xs text-muted-foreground">
                تاریخ‌های برگزاری را انتخاب کنید و زمان شروع و پایان را یک‌بار وارد کنید. تمام جلسات به‌صورت خودکار در پایگاه‌داده ایجاد خواهند شد.
              </p>

              {/* Jalali Multi-Date Picker */}
              <JalaliMultiDatePicker
                value={bulkDates}
                onChange={setBulkDates}
                label="انتخاب تاریخ‌های جلسات (تقویم شمسی - چندانتخابی) *"
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-xs font-semibold">
                    ساعت شروع *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-xs font-semibold">
                    ساعت پایان *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button
                type="submit"
                disabled={bulkCreateMutation.isPending || bulkDates.length === 0}
                className="bg-[var(--bytic-green)] hover:bg-[var(--bytic-green)]/90 text-white font-bold"
              >
                {bulkCreateMutation.isPending ? 'در حال ایجاد...' : `ایجاد ${toPersianDigits(bulkDates.length)} جلسه`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── SINGLE SESSION MODAL ─── */}
      <Dialog open={isSingleSessionOpen} onOpenChange={setIsSingleSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSingleCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">افزودن جلسه تکی</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <JalaliDatePicker
                id="singleDate"
                label="تاریخ جلسه"
                value={singleDate}
                onChange={setSingleDate}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="singleStartTime" className="text-xs font-semibold">
                    ساعت شروع *
                  </Label>
                  <Input
                    id="singleStartTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="singleEndTime" className="text-xs font-semibold">
                    ساعت پایان *
                  </Label>
                  <Input
                    id="singleEndTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsSingleSessionOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={createSessionMutation.isPending}>
                {m.btn_save()}
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
