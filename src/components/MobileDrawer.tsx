import { useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  GraduationCap,
  School,
  Users,
  UserCog,
  LogOut,
  Layers,
  X,
} from 'lucide-react';
import { m } from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageToggle } from '@/components/i18n/LanguageToggle';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onSelectTab,
}: MobileDrawerProps) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Automatically close drawer if window is resized to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  const navItems = [
    { to: '/dashboard', label: m.nav_dashboard(), icon: LayoutDashboard },
    { to: '/courses', label: m.nav_courses(), icon: GraduationCap },
    { to: '/classes', label: m.nav_classes(), icon: School },
    { to: '/students', label: m.nav_students(), icon: Users },
    ...(isAdmin
      ? [{ to: '/users', label: m.nav_users(), icon: UserCog, badge: 'مدیر' } as const]
      : []),
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div
        className="fixed inset-y-0 start-0 border-e z-50 w-72 max-w-[85vw] bg-card border-border flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-out"
      >
        <div className="space-y-6">
          {/* Top Header with Brand & Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  {m.app_title()}
                </h2>
                <span className="text-[10px] text-muted-foreground block">
                  {isAdmin ? m.role_admin() : m.role_teacher()}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile Badge */}
          {user && (
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs flex items-center justify-between">
              <div className="min-w-0 pe-2">
                <div className="font-bold text-foreground truncate">{user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
              </div>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0 shrink-0">
                {isAdmin ? 'مدیر' : 'استاد'}
              </Badge>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/classes'
                  ? pathname.startsWith('/classes') || pathname.startsWith('/sessions')
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    onSelectTab?.(item.to.slice(1));
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {'badge' in item && item.badge && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer: Theme/Language Toggles & Logout */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground font-medium">تنظیمات ظاهر</span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold h-11"
          >
            <LogOut className="h-4 w-4 me-2 rtl:-scale-x-100" />
            <span>{m.nav_logout()}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
