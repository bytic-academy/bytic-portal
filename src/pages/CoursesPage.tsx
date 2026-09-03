import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  type Course,
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
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';

export function CoursesPage() {
  const { isAdmin } = useAuth();
  const { data: courses = [], isLoading } = useCourses();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setName('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('نام دوره الزامی است');
      return;
    }

    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({ id: editingCourse.id, name: name.trim() });
        toast.success('دوره با موفقیت ویرایش شد');
      } else {
        await createMutation.mutateAsync({ name: name.trim() });
        toast.success('دوره جدید با موفقیت ایجاد شد');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleDelete = async (id: string, courseName: string) => {
    if (!confirm(`آیا از حذف دوره "${courseName}" اطمینان دارید؟`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('دوره با موفقیت حذف شد');
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
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>{m.nav_courses()}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تعریف و مدیریت دوره‌های آموزشی پلتفرم
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenCreate} className="font-bold gap-2">
            <Plus className="h-4 w-4" />
            <span>{m.btn_new_course()}</span>
          </Button>
        )}
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          در حال بارگذاری دوره‌ها...
        </div>
      ) : courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">هنوز دوره‌ای تعریف نشده است.</p>
            {isAdmin && (
              <Button onClick={handleOpenCreate} variant="outline" size="sm">
                ایجاد اولین دوره
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:border-primary/40 transition-colors shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    {course.name}
                  </CardTitle>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    {course._count?.classes || 0} کلاس
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(course)}
                        className="h-8 px-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5 me-1" />
                        <span>{m.btn_edit()}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id, course.name)}
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 me-1" />
                        <span>{m.btn_delete()}</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingCourse ? 'ویرایش دوره' : m.btn_new_course()}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="courseName" className="text-xs font-semibold">
                  نام دوره
                </Label>
                <Input
                  id="courseName"
                  placeholder="مثال: اسکرچ پیشرفته، طراحی وب کودکان"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {m.btn_cancel()}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {m.btn_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
