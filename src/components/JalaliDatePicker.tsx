import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { Calendar, X } from 'lucide-react';
import { formatJalaliMedium } from '@/lib/date';

export interface JalaliDatePickerProps {
  value?: string; // ISO Gregorian string: YYYY-MM-DD
  onChange: (isoDate: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  showPreview?: boolean;
}

export function JalaliDatePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ شمسی...',
  disabled = false,
  required = false,
  className = '',
  id,
  showPreview = true,
}: JalaliDatePickerProps) {
  const [dateObject, setDateObject] = useState<DateObject | null>(() => {
    if (!value) return null;
    try {
      return new DateObject({ date: value, calendar: gregorian, locale: gregorian_en });
    } catch {
      return null;
    }
  });

  // Keep internal DateObject in sync with external ISO value
  useEffect(() => {
    if (!value) {
      setDateObject(null);
      return;
    }
    try {
      const gDate = new DateObject({ date: value, calendar: gregorian, locale: gregorian_en });
      setDateObject(gDate);
    } catch {
      setDateObject(null);
    }
  }, [value]);

  const handleChange = (date: DateObject | null) => {
    if (!date) {
      setDateObject(null);
      onChange('');
      return;
    }
    setDateObject(date);
    // Convert selected Jalali date to ISO Gregorian string YYYY-MM-DD
    const gDate = new DateObject(date).convert(gregorian, gregorian_en);
    const isoString = gDate.format('YYYY-MM-DD');
    onChange(isoString);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateObject(null);
    onChange('');
  };

  const formattedPreview = value ? formatJalaliMedium(value) : null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-foreground flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="w-full">
          <DatePicker
            id={id}
            value={dateObject}
            onChange={handleChange}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            placeholder={placeholder}
            disabled={disabled}
            inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Clear & Icon Controls */}
        <div className="absolute end-3 flex items-center gap-1 pointer-events-none text-muted-foreground">
          {value && !disabled && !required && (
            <button
              type="button"
              onClick={handleClear}
              className="pointer-events-auto p-0.5 hover:text-destructive transition-colors rounded-sm"
              title="پاک کردن تاریخ"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Calendar className="h-4 w-4" />
        </div>
      </div>

      {showPreview && formattedPreview && (
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <span>{formattedPreview}</span>
          <span className="text-[10px] text-muted-foreground font-mono">({value})</span>
        </div>
      )}
    </div>
  );
}
