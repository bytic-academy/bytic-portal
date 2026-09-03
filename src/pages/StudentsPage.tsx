import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  type Student,
} from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
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
  Users,
  Plus,
  Pencil,
  Trash2,
  School,
} from 'lucide-react';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';

export function StudentsPage() {
  const { isAdmin } = useAuth();
  const { data: students = [], isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'NONE'>('NONE');
  const [about, setAbout] = useState('');

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setName('');
    setBirthdate('');
    setGender('NONE');
    setAbout('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setBirthdate(student.birthdate || '');
    setGender(student.gender || 'NONE');
    setAbout(student.about || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('نام دانش‌آموز الزامی است');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        birthdate: birthdate ? birthdate : undefined,
        gender: gender !== 'NONE' ? gender : undefined,
        about: about ? about.trim() : undefined,
      };

      if (editingStudent) {
        await updateMutation.mutateAsync({ id: editingStudent.id, ...payload });
        toast.success('اطلاعات دانش‌آموز با موفقیت ویرایش شد');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('دانش‌آموز جدید با موفقیت اضافه شد');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.msg_error());
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`آیا از حذف دانش‌آموز "${student.name}" اطمینان دارید؟`)) return;

    try {
      await deleteMutation.mutateAsync(student.id);
      toast.success('دانش‌آموز با موفقیت حذف شد');
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
            <Users className="h-6 w-6 text-primary" />
            <span>{m.nav_students()}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAdmin ? 'فهرست تمام دانش‌آموزان ثبت‌نامی' : 'دانش‌آموزان کلاس‌های تحت تدریس شما'}
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="font-bold gap-2">
          <Plus className="h-4 w-4" />
          <span>{m.btn_new_student()}</span>
        </Button>
      </div>

      {/* Student List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">در حال بارگذاری لیست دانش‌آموزان...</div>
      ) : students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Users className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">هنوز دانش‌آموزی ثبت نشده است.</p>
            <Button onClick={handleOpenCreate} variant="outline" size="sm">
              ثبت اولین دانش‌آموز
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card key={student.id} className="hover:border-primary/40 transition-colors shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-base text-foreground">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.gender === 'MALE' ? m.gender_male() : student.gender === 'FEMALE' ? m.gender_female() : 'نامشخص'}
                      {student.birthdate ? ` • متولد ${student.birthdate}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(student)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {student.about && (
                  <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md">
                    {student.about}
                  </p>
                )}

                {/* Enrolled classes */}
                <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1 font-medium text-foreground">
                    <School className="h-3.5 w-3.5 text-primary" />
                    <span>کلاس‌های ثبت‌نامی ({student.classes?.length || 0}):</span>
                  </div>
                  {student.classes && student.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {student.classes.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium"
                        >
                          {c.class.course?.name} ({c.class.name || 'عمومی'})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">هنوز در هیچ کلاسی ثبت نشده</span>
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
                {editingStudent ? 'ویرایش دانش‌آموز' : m.btn_new_student()}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentName" className="text-xs font-semibold">
                  نام و نام‌خانوادگی *
                </Label>
                <Input
                  id="studentName"
                  placeholder="مثال: پارسا احمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="birthdate" className="text-xs font-semibold">
                    تاریخ تولد (اختیاری)
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">جنسیت</Label>
                  <Select
                    value={gender}
                    onValueChange={(val: 'MALE' | 'FEMALE' | 'NONE') => setGender(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب جنسیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">نامشخص</SelectItem>
                      <SelectItem value="MALE">{m.gender_male()}</SelectItem>
                      <SelectItem value="FEMALE">{m.gender_female()}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="about" className="text-xs font-semibold">
                  توضیحات و یادداشت‌ها (اختیاری)
                </Label>
                <Input
                  id="about"
                  placeholder="مثال: علاقه‌مند به پایتون، نیازمند تمرین بیشتر"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {m.btn_cancel()}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {m.btn_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
