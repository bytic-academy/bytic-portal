import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import {
  Globe2,
  Palette,
  Sparkles,
  Database,
  Layers,
  Code2,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nProvider';
import { m } from '@/paraglide/messages';

export function App() {
  const { isRTL } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 space-y-8">
        {/* Welcome / Template Status Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bytic-navy)] via-[#152e47] to-[var(--bytic-surface)] p-6 sm:p-8 text-white shadow-lg border border-primary/20">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[var(--bytic-green)] animate-pulse" />
              <span>{m.welcome_title()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {m.app_title()}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {m.welcome_desc()}
            </p>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-[var(--bytic-green)]/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-[var(--bytic-coral)]/20 blur-3xl pointer-events-none" />
        </div>

        {/* Feature Development Canvas Placeholder */}
        <Card className="border-dashed border-2 bg-card/50 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span>Feature Canvas / بوم توسعه قابلیت‌ها</span>
              </CardTitle>
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Clean Slate Ready</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              پروژه بازنشانی شد و ساختار دامنه قبلی حذف گردید. اکنون می‌توانید ماژول‌ها و قابلیت‌های جدید را بر روی این بستر توسعه دهید.
            </p>
            <div className="p-4 rounded-lg bg-muted/40 border text-xs font-mono text-muted-foreground flex items-center gap-3">
              <Code2 className="h-4 w-4 text-primary shrink-0" />
              <span>Extend UI in <code className="text-foreground font-semibold">src/App.tsx</code> and routes in <code className="text-foreground font-semibold">api/_lib/router.ts</code></span>
            </div>
          </CardContent>
        </Card>

        {/* Architecture & Tech Stack Highlights */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[var(--bytic-green)]" />
              <h2 className="text-base sm:text-lg font-bold">
                {m.stack_overview()}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Database className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Turso + Prisma ORM</span>
                  <span className="text-muted-foreground">LibSQL adapter & SQLite support</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Globe2 className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Paraglide i18n + RTL First</span>
                  <span className="text-muted-foreground">CSS Logical Properties (Zero hardcoded dir)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Palette className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Bytic Color Palette</span>
                  <span className="text-muted-foreground">Brand Green, Coral, and Dark Navy</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                <Layers className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Radix UI & Tailwind v4</span>
                  <span className="text-muted-foreground">15 Accessible UI Primitives</span>
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
            <span className="font-bold text-foreground">{m.app_title()}</span>
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

export default App;
