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
    <aside className="hidden md:flex w-60 bg-card border-e border-border flex-col justify-between p-3.5 shrink-0 transition-colors duration-200 select-none">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground tracking-tight truncate">
              {m.app_title()}
            </h2>
            <span className="text-[10px] text-muted-foreground block truncate">
              {isAdmin ? m.role_admin() : m.role_teacher()}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {'badge' in item && item.badge && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/40">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout footer */}
      <div className="pt-3 border-t border-border/70 space-y-2">
        {user && (
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <div className="font-bold text-foreground text-xs truncate">{user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
              </div>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0 shrink-0">
                {isAdmin ? 'مدیر' : 'استاد'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2 font-medium"
            >
              <LogOut className="h-3.5 w-3.5 me-1.5 rtl:-scale-x-100" />
              <span>{m.nav_logout()}</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
