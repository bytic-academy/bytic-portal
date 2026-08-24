import { Check, X, Clock, AlertCircle, MoreHorizontal, Phone, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/components/i18n/I18nProvider';
import { m } from '@/paraglide/messages';
import type { Student, AttendanceStatus, CourseType } from '@/data/mockStudents';

interface AttendanceTableProps {
  students: Student[];
  onUpdateStatus: (id: string, newStatus: AttendanceStatus) => void;
}

export function AttendanceTable({
  students,
  onUpdateStatus,
}: AttendanceTableProps) {
  const { locale } = useI18n();

  const getCourseName = (course: CourseType) => {
    switch (course) {
      case 'scratch_jr':
        return m.filter_scratch_jr();
      case 'scratch':
        return m.filter_scratch();
      case 'web_design':
        return m.filter_web_design();
      case 'python':
        return m.filter_python();
      default:
        return course;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <Badge variant="present" className="font-medium gap-1">
            <Check className="h-3 w-3" />
            {m.status_present()}
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="absent" className="font-medium gap-1">
            <X className="h-3 w-3" />
            {m.status_absent()}
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="late" className="font-medium gap-1">
            <Clock className="h-3 w-3" />
            {m.status_late()}
          </Badge>
        );
      case 'justified':
        return (
          <Badge variant="justified" className="font-medium gap-1">
            <AlertCircle className="h-3 w-3" />
            {m.status_justified()}
          </Badge>
        );
    }
  };

  const getInitials = (student: Student) => {
    if (locale === 'fa') {
      return student.nameFa.slice(0, 2);
    }
    const parts = student.nameEn.split(' ');
    return parts.map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">{m.col_student()}</TableHead>
            <TableHead>{m.col_student_id()}</TableHead>
            <TableHead>{m.col_course()}</TableHead>
            <TableHead>{m.col_time()}</TableHead>
            <TableHead>{m.col_status()}</TableHead>
            <TableHead className="text-end">{m.col_actions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                دانش‌آموزی با این مشخصات یافت نشد. / No students found.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="group">
                {/* Student Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-primary/20 bg-primary/5">
                      <AvatarFallback className="text-primary font-bold">
                        {getInitials(student)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {locale === 'fa' ? student.nameFa : student.nameEn}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{student.guardianPhone}</span>
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* ID */}
                <TableCell>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    {student.studentId}
                  </span>
                </TableCell>

                {/* Course */}
                <TableCell>
                  <span className="text-sm font-medium text-foreground/90">
                    {getCourseName(student.course)}
                  </span>
                </TableCell>

                {/* Check-in time */}
                <TableCell>
                  <span className="text-sm text-muted-foreground" dir="ltr">
                    {student.checkInTime ? `${student.checkInTime}` : '—'}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(student.status)}</TableCell>

                {/* Actions */}
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    {/* Quick check-in toggle button */}
                    {student.status !== 'present' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(student.id, 'present')}
                        className="h-8 px-2 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                        title={m.btn_check_in()}
                      >
                        <CheckCircle2 className="h-4 w-4 me-1" />
                        <span className="text-xs hidden sm:inline">{m.btn_check_in()}</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(student.id, 'absent')}
                        className="h-8 px-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 cursor-pointer"
                        title={m.btn_mark_absent()}
                      >
                        <X className="h-4 w-4 me-1" />
                        <span className="text-xs hidden sm:inline">{m.btn_mark_absent()}</span>
                      </Button>
                    )}

                    {/* More actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {m.quick_status_update()}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(student.id, 'present')}
                          className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                        >
                          <Check className="h-4 w-4" />
                          <span>{m.status_present()}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(student.id, 'late')}
                          className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                        >
                          <Clock className="h-4 w-4" />
                          <span>{m.status_late()}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(student.id, 'absent')}
                          className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                          <span>{m.status_absent()}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(student.id, 'justified')}
                          className="gap-2 cursor-pointer text-sky-600 dark:text-sky-400"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{m.status_justified()}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
