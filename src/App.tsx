import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { I18nProvider, useI18n } from '@/components/i18n/I18nProvider';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { ClassesPage } from '@/pages/ClassesPage';
import { ClassDetailPage } from '@/pages/ClassDetailPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AttendanceSheetPage } from '@/pages/AttendanceSheetPage';
import { Toaster } from 'sonner';
import { Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppMain() {
  const { user, isLoading, isAdmin } = useAuth();
  const { isRTL } = useI18n();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[var(--bytic-green)] to-[var(--bytic-coral)] flex items-center justify-center text-white font-black shadow-lg animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-sm font-bold text-muted-foreground">در حال بارگذاری سامانه...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Handle Tab Switch
  const handleSelectTab = (tab: string) => {
    setSelectedClassId(null);
    setSelectedSessionId(null);
    setCurrentTab(tab);
  };

  // Handle Class Navigation
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSessionId(null);
    setCurrentTab('classes');
  };

  // Handle Attendance Navigation
  const handleTakeAttendance = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* View Routing */}
          {selectedSessionId ? (
            <AttendanceSheetPage
              sessionId={selectedSessionId}
              onBack={() => setSelectedSessionId(null)}
            />
          ) : selectedClassId ? (
            <ClassDetailPage
              classId={selectedClassId}
              onBack={() => setSelectedClassId(null)}
              onTakeAttendance={handleTakeAttendance}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardPage onNavigate={handleSelectTab} />
          ) : currentTab === 'courses' ? (
            <CoursesPage />
          ) : currentTab === 'classes' ? (
            <ClassesPage onSelectClass={handleSelectClass} />
          ) : currentTab === 'students' ? (
            <StudentsPage />
          ) : currentTab === 'users' && isAdmin ? (
            <UsersPage />
          ) : (
            <DashboardPage onNavigate={handleSelectTab} />
          )}
        </main>
      </div>

      {/* Global Toast Notification System */}
      <Toaster
        dir={isRTL ? 'rtl' : 'ltr'}
        position={isRTL ? 'top-left' : 'top-right'}
        richColors
        closeButton
      />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <AppMain />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
