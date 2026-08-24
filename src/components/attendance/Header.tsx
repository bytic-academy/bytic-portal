import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageToggle } from '@/components/i18n/LanguageToggle';
import { Badge } from '@/components/ui/badge';
import { Sparkles, GraduationCap } from 'lucide-react';
import { m } from '@/paraglide/messages';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bytic-green)] to-emerald-700 shadow-md text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[var(--bytic-green)] to-emerald-600 bg-clip-text text-transparent">
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{m.today_date()}</span>
          </div>

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
