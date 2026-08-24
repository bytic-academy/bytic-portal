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
import { UserPlus } from 'lucide-react';
import { m } from '@/paraglide/messages';
import type { Student, CourseType } from '@/data/mockStudents';

interface AddStudentDialogProps {
  onAddStudent: (student: Omit<Student, 'id'>) => void;
}

export function AddStudentDialog({ onAddStudent }: AddStudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [nameFa, setNameFa] = React.useState('');
  const [nameEn, setNameEn] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [course, setCourse] = React.useState<CourseType>('scratch_jr');
  const [guardianPhone, setGuardianPhone] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa || !studentId) return;

    onAddStudent({
      nameFa,
      nameEn: nameEn || nameFa,
      studentId,
      course,
      guardianPhone: guardianPhone || '09120000000',
      status: 'present',
      checkInTime: new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    setNameFa('');
    setNameEn('');
    setStudentId('');
    setGuardianPhone('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value as CourseType)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-start cursor-pointer"
              >
                <option value="scratch_jr">{m.filter_scratch_jr()}</option>
                <option value="scratch">{m.filter_scratch()}</option>
                <option value="web_design">{m.filter_web_design()}</option>
                <option value="python">{m.filter_python()}</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {m.btn_cancel()}
            </Button>
            <Button
              type="submit"
              className="bg-[var(--bytic-green)] hover:opacity-90 text-white"
            >
              {m.btn_save()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
