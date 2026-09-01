import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { m } from '@/paraglide/messages';
import type { CourseType, CreateStudentInput } from '@/types/attendance';

interface AddStudentDialogProps {
  onAddStudent: (student: CreateStudentInput) => Promise<unknown> | void;
}

export function AddStudentDialog({ onAddStudent }: AddStudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [nameFa, setNameFa] = React.useState('');
  const [nameEn, setNameEn] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [course, setCourse] = React.useState<CourseType>('scratch_jr');
  const [guardianPhone, setGuardianPhone] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa || !studentId) return;

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onAddStudent({
        nameFa,
        nameEn: nameEn || nameFa,
        studentId,
        course,
        guardianPhone: guardianPhone || '09120000000',
      });

      setNameFa('');
      setNameEn('');
      setStudentId('');
      setGuardianPhone('');
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطا در ثبت دانش‌آموز');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setFormError(null); }}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--bytic-green)] hover:opacity-90 text-white shadow-sm gap-2 cursor-pointer select-none">
          <UserPlus className="h-4 w-4" />
          <span>{m.btn_add_student()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{m.btn_add_student()}</DialogTitle>
            <DialogDescription>
              اطلاعات دانش‌آموز جدید را جهت ثبت در سامانه بایتک وارد کنید.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mt-2 p-2.5 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nameFa">{m.student_name_label()} (فارسی)</Label>
              <Input
                id="nameFa"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثال: پارسا صادقی"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nameEn">{m.student_name_label()} (English)</Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Parsa Sadeghi"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="studentId">{m.col_student_id()}</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="BYT-1050"
                  dir="ltr"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">{m.guardian_phone_label()}</Label>
                <Input
                  id="phone"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="09121234567"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">{m.course_label()}</Label>
              <Select
                value={course}
                onValueChange={(val) => setCourse(val as CourseType)}
              >
                <SelectTrigger id="course" className="w-full">
                  <SelectValue placeholder={m.course_label()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scratch_jr">{m.filter_scratch_jr()}</SelectItem>
                  <SelectItem value="scratch">{m.filter_scratch()}</SelectItem>
                  <SelectItem value="web_design">{m.filter_web_design()}</SelectItem>
                  <SelectItem value="python">{m.filter_python()}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {m.btn_cancel()}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--bytic-green)] hover:opacity-90 text-white cursor-pointer"
            >
              {isSubmitting ? 'در حال ذخیره...' : m.btn_save()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
