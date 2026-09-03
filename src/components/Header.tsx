import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageToggle } from '@/components/i18n/LanguageToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Layers, Menu } from 'lucide-react';
import { m } from '@/paraglide/messages';

interface HeaderProps {
  onOpenDrawer?: () => void;
}

export function Header({ onOpenDrawer }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenDrawer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenDrawer}
              className="md:hidden h-11 w-11 shrink-0 text-foreground hover:bg-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}

          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bytic-green)] to-emerald-700 shadow-md text-white shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-[var(--bytic-green)] to-emerald-600 bg-clip-text text-transparent">
                {m.app_title()}
              </span>
              <Badge
                variant="outline"
                className="hidden md:inline-flex text-[10px] font-medium border-primary/30 text-primary bg-primary/5"
              >
                React 19 & Tailwind v4
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {m.app_subtitle()}
            </span>
          </div>
        </div>

        {/* Right side controls: Badges, Language, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Badge
            variant="outline"
            className="hidden xl:inline-flex items-center gap-1 text-[11px] font-normal border-border bg-card/60 text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>{m.rtl_ltr_badge()}</span>
          </Badge>

          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
