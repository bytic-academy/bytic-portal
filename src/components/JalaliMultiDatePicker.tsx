import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits, formatJalaliMedium } from '@/lib/date';

interface JalaliMultiDatePickerProps {
  value: string[]; // ISO date strings ['2026-09-10', '2026-09-17']
  onChange: (dates: string[]) => void;
  label?: string;
}

export function JalaliMultiDatePicker({
  value,
  onChange,
  label,
}: JalaliMultiDatePickerProps) {
  const [dateObjects, setDateObjects] = useState<DateObject[]>(() => {
    return value.map((d) => new DateObject({ date: d, calendar: gregorian, locale: gregorian_en }));
  });

  // Sync internal state when external value changes
  useEffect(() => {
    const updated = value.map(
      (d) => new DateObject({ date: d, calendar: gregorian, locale: gregorian_en })
    );
    setDateObjects(updated);
  }, [value]);

  const handleChange = (dates: DateObject[] | null) => {
    if (!dates) {
      setDateObjects([]);
      onChange([]);
      return;
    }
    setDateObjects(dates);

    // Convert each selected Persian/Jalali date to ISO Gregorian string YYYY-MM-DD
    const isoDates = dates.map((d) => {
      const gDate = new DateObject(d).convert(gregorian, gregorian_en);
      return gDate.format('YYYY-MM-DD');
    });

    onChange(isoDates);
  };

  const handleClear = () => {
    setDateObjects([]);
    onChange([]);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <DatePicker
            multiple
            value={dateObjects}
            onChange={handleChange}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            containerClassName="w-full sm:w-80"
            containerStyle={{ width: '100%' }}
            inputClass="flex h-10 w-full sm:w-80 rounded-md border border-input bg-background ps-3 pe-10 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="انتخاب تاریخ‌های جلسات (چندانتخابی)"
            format="YYYY/MM/DD"
          />
          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        {value.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 me-1" />
            پاک کردن تاریخ‌ها ({toPersianDigits(value.length)})
          </Button>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((isoDate, index) => {
            const jalaliMedium = formatJalaliMedium(isoDate);
            return (
              <span
                key={isoDate || index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
              >
                <Calendar className="h-3 w-3" />
                <span>{jalaliMedium}</span>
                <span className="text-[10px] text-muted-foreground font-mono">({isoDate})</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
