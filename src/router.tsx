import { useState } from 'react';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useRouteContext,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { User } from '@/hooks/useAuth';
import { useI18n } from '@/components/i18n/I18nProvider';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileDrawer } from '@/components/MobileDrawer';
import { Toaster } from 'sonner';
import { Sparkles } from 'lucide-react';

import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { ClassesPage } from '@/pages/ClassesPage';
import { ClassDetailPage } from '@/pages/ClassDetailPage';
import { AttendanceSheetPage } from '@/pages/AttendanceSheetPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { UsersPage } from '@/pages/UsersPage';

export interface RouterAuthContext {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface RouterContext {
  auth: RouterAuthContext;
  queryClient: QueryClient;
}

// 1. Root Route
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

// 2. Public Login Route
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (!context.auth.isLoading && context.auth.user) {
      throw redirect({
        to: search.redirect || '/dashboard',
        replace: true,
      });
    }
  },
  component: LoginPage,
});

// 3. Authenticated Layout Component
function AuthenticatedLayout() {
  const { auth } = useRouteContext({ from: authenticatedRoute.id });
  const { isRTL } = useI18n();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (auth.isLoading) {
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

  if (!auth.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      <Header onOpenDrawer={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
      </div>
      <Toaster
        dir={isRTL ? 'rtl' : 'ltr'}
        position={isRTL ? 'top-left' : 'top-right'}
        richColors
        closeButton
      />
    </div>
  );
}

// 4. Authenticated Layout Shell Route
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) {
      return;
    }
    if (!context.auth.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href !== '/login' ? location.href : undefined,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

// 5. Authenticated Child Routes
export const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard', replace: true });
  },
});

export const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

export const coursesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/courses',
  component: CoursesPage,
});

export const classesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/classes',
  component: ClassesPage,
});

export const classDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/classes/$classId',
  component: ClassDetailPage,
});

export const attendanceRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/sessions/$sessionId/attendance',
  component: AttendanceSheetPage,
});

export const studentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/students',
  component: StudentsPage,
});

export const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users',
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoading && context.auth.user && !context.auth.isAdmin) {
      throw redirect({ to: '/dashboard', replace: true });
    }
  },
  component: UsersPage,
});

// 6. Catch-all fallback
export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard', replace: true });
  },
});

// 7. Route Tree & Router Instance
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    coursesRoute,
    classesRoute,
    classDetailRoute,
    attendanceRoute,
    studentsRoute,
    usersRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
