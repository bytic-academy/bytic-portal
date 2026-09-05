import { Link, useRouterState } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageToggle } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Menu, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nProvider';
import { m } from '@/paraglide/messages';

interface HeaderProps {
  onOpenDrawer?: () => void;
}

export function Header({ onOpenDrawer }: HeaderProps) {
  const { isRTL } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const SeparatorIcon = isRTL ? ChevronLeft : ChevronRight;

  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') {
      return [{ label: m.nav_dashboard(), to: '/dashboard', current: true }];
    }
    if (pathname === '/courses') {
      return [{ label: m.nav_courses(), to: '/courses', current: true }];
    }
    if (pathname === '/classes') {
      return [{ label: m.nav_classes(), to: '/classes', current: true }];
    }
    if (pathname.startsWith('/classes/')) {
      return [
        { label: m.nav_classes(), to: '/classes', current: false },
        { label: 'جزئیات کلاس', to: pathname, current: true },
      ];
    }
    if (pathname.startsWith('/sessions/')) {
      return [
        { label: m.nav_classes(), to: '/classes', current: false },
        { label: m.btn_attendance(), to: pathname, current: true },
      ];
    }
    if (pathname === '/students') {
      return [{ label: m.nav_students(), to: '/students', current: true }];
    }
    if (pathname === '/users') {
      return [{ label: m.nav_users(), to: '/users', current: true }];
    }
    return [{ label: m.app_title(), to: '/dashboard', current: true }];
  };

  const breadcrumbs = getBreadcrumbs();
  const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.label || m.app_title();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/75 backdrop-blur-md transition-colors">
      <div className="flex h-14 sm:h-15 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Mobile Menu & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenDrawer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenDrawer}
              className="md:hidden h-10 w-10 shrink-0 text-foreground hover:bg-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Title View */}
          <div className="flex items-center gap-2 md:hidden min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-foreground truncate">
              {currentTitle}
            </span>
          </div>

          {/* Desktop Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.to + idx} className="flex items-center gap-1.5">
                {idx > 0 && <SeparatorIcon className="h-3.5 w-3.5 opacity-40 shrink-0" />}
                {crumb.current ? (
                  <span className="font-semibold text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Side: Language & Theme Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
