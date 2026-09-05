import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useClasses,
  useCourses,
  useCreateClass,
  useDeleteClass,
  type ClassEntity,
} from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  School,
  Plus,
  Users,
  Calendar,
  UserCheck,
  ArrowUpLeft,
  Trash2,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import { toPersianDigits } from '@/lib/date';

interface ClassesPageProps {
  onSelectClass?: (classId: string) => void;
}

export function ClassesPage({ onSelectClass }: ClassesPageProps = {}) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: classes = [], isLoading } = useClasses();
  const { data: courses = [] } = useCourses();
  const createMutation = useCreateClass();
  const deleteMutation = useDeleteClass();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('لطفا دوره مربوطه را انتخاب کنید');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: className.trim(),
        courseId: selectedCourseId,
      });
      toast.success('کلاس جدید ایجاد شد');
      setIsCreateOpen(false);
      setClassName('');
      setSelectedCourseId('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`آیا از حذف کلاس "${name || 'بدون نام'}" اطمینان دارید؟`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('کلاس با موفقیت حذف شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span>{m.nav_classes()}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAdmin ? 'مدیریت و مشاهده تمام کلاس‌ها' : 'کلاس‌های اختصاص‌یافته به شما'}
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="font-bold gap-2 w-full sm:w-auto h-11 sm:h-9">
            <Plus className="h-4 w-4" />
            <span>{m.btn_new_class()}</span>
          </Button>
        )}
      </div>

      {/* Class Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          در حال بارگذاری کلاس‌ها...
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <School className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'هنوز کلاسی ثبت نشده است.' : 'هیچ کلاسی به شما اختصاص داده نشده است.'}
            </p>
            {isAdmin && (
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm" className="w-full sm:w-auto h-11 sm:h-9">
                ایجاد اولین کلاس
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {classes.map((cls: ClassEntity) => {
            const teachersList = cls.teachers?.map((t) => t.user.name).join('، ') || 'بدون استاد';
            return (
              <Card
                key={cls.id}
                onClick={() => {
                  onSelectClass?.(cls.id);
                  navigate({ to: '/classes/$classId', params: { classId: cls.id } });
                }}
                className="hover:border-primary/50 transition-all cursor-pointer shadow-xs group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-primary block">
                        {cls.course?.name}
                      </span>
                      <CardTitle className="text-base font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
                        {cls.name || 'کلاس عمومی'}
                      </CardTitle>
                    </div>
                    <ArrowUpLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Teachers */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">اساتید: {teachersList}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border/50 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{toPersianDigits(cls._count?.students || 0)} دانش‌آموز</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{toPersianDigits(cls._count?.sessions || 0)} جلسه</span>
                    </span>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, cls.id, cls.name)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{m.btn_new_class()}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">انتخاب دوره *</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="یک دوره را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="className" className="text-xs font-semibold">
                  نام / عنوان کلاس (اختیاری)
                </Label>
                <Input
                  id="className"
                  placeholder="مثال: کد A - روزهای فرد، ترم پاییز"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {m.btn_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
