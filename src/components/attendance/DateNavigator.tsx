import { Calendar, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/components/i18n/I18nProvider';
import {
  formatLocalizedDate,
  formatJalaliShort,
  addDaysToISODate,
  getTodayISO,
  isToday,
} from '@/lib/date';

interface DateNavigatorProps {
  selectedDate: string; // ISO YYYY-MM-DD
  onDateChange: (date: string) => void;
  isLoading?: boolean;
}

export function DateNavigator({
  selectedDate,
  onDateChange,
  isLoading = false,
}: DateNavigatorProps) {
  const { locale, isRTL } = useI18n();

  const isCurrentDayToday = isToday(selectedDate);
  const formattedDate = formatLocalizedDate(selectedDate, locale as 'fa' | 'en');
  const shortJalali = formatJalaliShort(selectedDate);

  const handlePrevDay = () => {
    onDateChange(addDaysToISODate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDaysToISODate(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(getTodayISO());
  };

  // In RTL: Previous Day is pointing right (towards past in logical RTL) or ChevronRight.
  // We use logical Previous/Next handlers:
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-card border shadow-xs">
      {/* Current date label & indicators */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-foreground">
              {formattedDate}
            </span>
            {isCurrentDayToday ? (
              <Badge variant="default" className="bg-[var(--bytic-green)] text-white text-[10px] h-5 px-1.5 font-medium">
                {locale === 'fa' ? 'امروز' : 'Today'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-[10px] h-5 px-1.5">
                {shortJalali}
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {locale === 'fa'
              ? 'مشاهده و ثبت وضعیت حضور و غیاب در این تاریخ'
              : 'Viewing and logging attendance for this date'}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevDay}
          disabled={isLoading}
          className="h-8 sm:h-9 px-2.5 text-xs gap-1 cursor-pointer"
          title={locale === 'fa' ? 'روز قبل' : 'Previous Day'}
        >
          <PrevIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{locale === 'fa' ? 'روز قبل' : 'Prev'}</span>
        </Button>

        {!isCurrentDayToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            disabled={isLoading}
            className="h-8 sm:h-9 px-2.5 text-xs gap-1 text-primary hover:bg-primary/10 cursor-pointer"
            title={locale === 'fa' ? 'بازگشت به امروز' : 'Jump to Today'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{locale === 'fa' ? 'امروز' : 'Today'}</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextDay}
          disabled={isLoading}
          className="h-8 sm:h-9 px-2.5 text-xs gap-1 cursor-pointer"
          title={locale === 'fa' ? 'روز بعد' : 'Next Day'}
        >
          <span className="hidden sm:inline">{locale === 'fa' ? 'روز بعد' : 'Next'}</span>
          <NextIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
