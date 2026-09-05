import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  GraduationCap,
  School,
  Users,
  UserCog,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { m } from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function Sidebar({ onSelectTab }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { to: '/dashboard', label: m.nav_dashboard(), icon: LayoutDashboard },
    { to: '/courses', label: m.nav_courses(), icon: GraduationCap },
    { to: '/classes', label: m.nav_classes(), icon: School },
    { to: '/students', label: m.nav_students(), icon: Users },
    ...(isAdmin
      ? [{ to: '/users', label: m.nav_users(), icon: UserCog, badge: 'مدیر' } as const]
      : []),
  ] as const;

  return (
    <aside className="hidden md:flex w-64 bg-card border-e border-border flex-col justify-between p-4 shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[var(--bytic-green)] to-[var(--bytic-coral)] flex items-center justify-center text-white font-black shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground tracking-tight">
              {m.app_title()}
            </h2>
            <span className="text-[11px] text-muted-foreground block">
              {isAdmin ? m.role_admin() : m.role_teacher()}
            </span>
          </div>
        </div>

        {/* User Badge */}
        {user && (
          <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-xs space-y-1">
            <div className="font-bold text-foreground truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            <div className="pt-1">
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[10px] px-2 py-0">
                {isAdmin ? 'دسترسی کامل (Admin)' : 'دسترسی استاد (Teacher)'}
              </Badge>
            </div>
          </div>
        )}

        {/* Nav Links */}
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
                onClick={() => onSelectTab?.(item.to.slice(1))}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
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

      {/* Logout */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-medium"
        >
          <LogOut className="h-4 w-4 me-2 rtl:-scale-x-100" />
          <span>{m.nav_logout()}</span>
        </Button>
      </div>
    </aside>
  );
}
