import * as React from 'react';
import { setLocale as setParaglideLocale, getLocale, baseLocale } from '@/paraglide/runtime';

export type AppLocale = 'fa' | 'en';

interface I18nContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<AppLocale>(() => {
    if (typeof window === 'undefined') return baseLocale as AppLocale;
    const stored = localStorage.getItem('PARAGLIDE_LOCALE');
    if (stored === 'fa' || stored === 'en') return stored;
    try {
      const current = getLocale();
      if (current === 'fa' || current === 'en') return current;
    } catch {
      // fallback to base
    }
    return (baseLocale as AppLocale) || 'fa';
  });

  const dir: 'rtl' | 'ltr' = locale === 'fa' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const setLocale = React.useCallback((newLocale: AppLocale) => {
    localStorage.setItem('PARAGLIDE_LOCALE', newLocale);
    try {
      setParaglideLocale(newLocale, { reload: false });
    } catch {
      // ignore reload requirement if any
    }
    setLocaleState(newLocale);
  }, []);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', locale);
    }
  }, [dir, locale]);

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      dir,
      isRTL,
    }),
    [locale, setLocale, dir, isRTL]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
