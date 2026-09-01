import * as React from 'react';
import { Header } from '@/components/attendance/Header';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { AddStudentDialog } from '@/components/attendance/AddStudentDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Download,
  CheckCheck,
  Globe2,
  Palette,
  FileCheck2,
  Sparkles,
  RefreshCw,
  Database,
} from 'lucide-react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import type { AttendanceStatus, CourseType, CreateStudentInput } from '@/types/attendance';
import { useI18n } from '@/components/i18n/I18nProvider';
import { m } from '@/paraglide/messages';

export function App() {
  const {
    students,
    isLoading,
    isSyncing,
    error,
    updateStatus,
    addStudent,
    markAllPresent,
    refresh,
  } = useAttendanceData();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const { locale, isRTL } = useI18n();

  // Status update handler
  const handleUpdateStatus = (id: string, newStatus: AttendanceStatus) => {
    updateStatus(id, newStatus, locale);
  };

  // Add student handler
  const handleAddStudent = (newStudent: CreateStudentInput) => {
    addStudent(newStudent);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    markAllPresent(selectedCourse, locale);
  };

  // Export handler
  const handleExport = () => {
    const headers = ['ID', 'Name (FA)', 'Name (EN)', 'Course', 'Status', 'Time', 'Guardian Phone'];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.nameFa,
      s.nameEn,
      s.course,
      s.status,
      s.checkInTime || '—',
      s.guardianPhone,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bytic-attendance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students
  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      const matchesCourse =
        selectedCourse === 'all' || student.course === (selectedCourse as CourseType);
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.nameFa.toLowerCase().includes(query) ||
        student.nameEn.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query) ||
        student.guardianPhone.includes(query);

      return matchesCourse && matchesSearch;
    });
  }, [students, selectedCourse, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* Banner / Live Status Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bytic-navy)] via-[#152e47] to-[var(--bytic-surface)] p-6 text-white shadow-lg border border-primary/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[var(--bytic-green)] animate-pulse"></span>
                <span>{m.live_session_alert()}</span>
                {isSyncing && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 ms-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>همگام‌سازی با پایگاه داده...</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                {m.app_title()}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                {m.app_subtitle()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AddStudentDialog onAddStudent={handleAddStudent} />
              <Button
                variant="outline"
                onClick={handleMarkAllPresent}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white cursor-pointer"
              >
                <CheckCheck className="h-4 w-4 me-1.5 text-emerald-400" />
                <span className="text-xs sm:text-sm">حاضر کردن همه</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refresh()}
                className="text-white hover:bg-white/20 cursor-pointer h-10 w-10"
                title="تازه سازی داده ها"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-[var(--bytic-green)]/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-[var(--bytic-coral)]/20 blur-3xl pointer-events-none" />
        </div>

        {/* Error notification banner if any */}
        {error && (
          <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-between">
            <span>توجه: {error} (داده‌ها به صورت محلی در دسترس هستند)</span>
            <Button size="sm" variant="ghost" onClick={() => refresh()} className="h-6 text-xs px-2">
              تلاش مجدد
            </Button>
          </div>
        )}

        {/* Attendance Statistics Cards */}
        <AttendanceStats students={students} />

        {/* Filter and Search Controls Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Course Tabs Filter */}
          <Tabs
            value={selectedCourse}
            onValueChange={setSelectedCourse}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-2 sm:flex sm:flex-row w-full h-auto p-1 gap-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                {m.filter_all()}
              </TabsTrigger>
              <TabsTrigger value="scratch_jr" className="text-xs sm:text-sm">
                {m.filter_scratch_jr()}
              </TabsTrigger>
              <TabsTrigger value="scratch" className="text-xs sm:text-sm">
                {m.filter_scratch()}
              </TabsTrigger>
              <TabsTrigger value="web_design" className="text-xs sm:text-sm">
                {m.filter_web_design()}
              </TabsTrigger>
              <TabsTrigger value="python" className="text-xs sm:text-sm">
                {m.filter_python()}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input & Export Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={m.search_placeholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-10 bg-card"
              />
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={handleExport}
              className="gap-2 h-10 shrink-0 cursor-pointer"
              title={m.btn_export()}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{m.btn_export()}</span>
            </Button>
          </div>
        </div>

        {/* Attendance Table */}
        <AttendanceTable
          students={filteredStudents}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Architecture & Tech Stack Highlights */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[var(--bytic-green)]" />
              <h2 className="text-base sm:text-lg font-bold">
                مشخصات فنی و معماری پروژه بایتک / Architecture Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Database className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Turso + Prisma ORM</span>
                  <span className="text-muted-foreground">Serverless SQLite on Vercel with @prisma/adapter-libsql</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Globe2 className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Paraglide i18n + RTL First</span>
                  <span className="text-muted-foreground">CSS Logical Properties (Zero hardcoded rtl/ltr variants)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Palette className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Bytic.ir Color Palette</span>
                  <span className="text-muted-foreground">Green #35b40e, Coral #fb4364, Dark Navy #0e2338</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <FileCheck2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">OpenSpec SDD</span>
                  <span className="text-muted-foreground">Change specification & task verification</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-12 text-center text-xs sm:text-sm text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Bytic Attendance System</span>
            <span>—</span>
            <span>{m.powered_by()}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[11px]">
              Vazirmatn Font
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {isRTL ? 'جهت: راست‌به‌چپ (RTL)' : 'Direction: LTR'}
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
