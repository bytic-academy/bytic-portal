import { Globe } from 'lucide-react';
import { useI18n, type AppLocale } from './I18nProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { m } from '@/paraglide/messages';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const handleSelect = (lang: AppLocale) => {
    setLocale(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-3 bg-background/80 backdrop-blur-xs border-border cursor-pointer select-none"
          aria-label="Switch Language"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="font-semibold text-xs uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleSelect('fa')}
          className="gap-2 cursor-pointer"
        >
          <span className="text-base">🇮🇷</span>
          <span>{m.lang_persian()}</span>
          {locale === 'fa' && (
            <span className="ms-auto text-xs font-bold text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('en')}
          className="gap-2 cursor-pointer"
        >
          <span className="text-base">🇬🇧</span>
          <span>{m.lang_english()}</span>
          {locale === 'en' && (
            <span className="ms-auto text-xs font-bold text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
