import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { m } from '@/paraglide/messages';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.login_error());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/20">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-[var(--bytic-green)] to-[var(--bytic-coral)] flex items-center justify-center text-white font-black shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-black">{m.login_title()}</CardTitle>
          <CardDescription className="text-xs">
            {m.app_subtitle()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                {m.login_email()}
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="admin@bytic.ir"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">
                {m.login_password()}
              </Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold shadow-md bg-[var(--bytic-green)] hover:bg-[var(--bytic-green)]/90 text-white"
            >
              <LogIn className="h-4 w-4 me-2" />
              {isLoading ? 'در حال ورود...' : m.login_btn()}
            </Button>

            <div className="p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground text-center space-y-1">
              <div>حساب پیش‌فرض مدیر: <code className="text-foreground font-semibold">admin@bytic.ir</code></div>
              <div>رمز عبور پیش‌فرض: <code className="text-foreground font-semibold">admin123</code></div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
