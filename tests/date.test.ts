import { describe, it, expect } from 'vitest';
import {
  gregorianToJalali,
  jalaliToGregorian,
  toPersianDigits,
  formatJalaliFull,
  formatJalaliShort,
  formatLocalizedDate,
  addDaysToISODate,
  parseISODate,
  formatDateToISO,
  isToday,
  getTodayISO,
} from '../src/lib/date';

describe('Date & Solar Hijri (Jalali) Conversion Engine', () => {
  it('converts Gregorian dates to Jalali correctly for known anchors', () => {
    // 2026-03-21 -> 1405-01-01 (Nowruz 1405)
    const nowruz2026 = gregorianToJalali(2026, 3, 21);
    expect(nowruz2026).toEqual({ jy: 1405, jm: 1, jd: 1 });

    // 2026-09-01 -> 1405-06-10
    const sep2026 = gregorianToJalali(2026, 9, 1);
    expect(sep2026).toEqual({ jy: 1405, jm: 6, jd: 10 });

    // 2024-02-29 (Leap year leap day) -> 1402-12-10
    const leapDay = gregorianToJalali(2024, 2, 29);
    expect(leapDay).toEqual({ jy: 1402, jm: 12, jd: 10 });
  });

  it('converts Jalali dates back to Gregorian with full fidelity (roundtrip)', () => {
    const originalJalali = { jy: 1405, jm: 6, jd: 10 };
    const greg = jalaliToGregorian(originalJalali.jy, originalJalali.jm, originalJalali.jd);
    expect(greg).toEqual({ gy: 2026, gm: 9, gd: 1 });

    const roundtripJalali = gregorianToJalali(greg.gy, greg.gm, greg.gd);
    expect(roundtripJalali).toEqual(originalJalali);
  });

  it('converts Western numbers and strings to Persian digits', () => {
    expect(toPersianDigits(12345)).toBe('۱۲۳۴۵');
    expect(toPersianDigits('BYT-1050')).toBe('BYT-۱۰۵۰');
    expect(toPersianDigits('2026/09/01')).toBe('۲۰۲۶/۰۹/۰۱');
  });

  it('formats full Persian date string', () => {
    const formatted = formatJalaliFull('2026-09-01');
    expect(formatted).toContain('شهریور');
    expect(formatted).toContain('۱۰');
    expect(formatted).toContain('۱۴۰۵');
  });

  it('formats short Jalali date string', () => {
    const formatted = formatJalaliShort('2026-09-01');
    expect(formatted).toBe('۱۴۰۵/۰۶/۱۰');
  });

  it('formats localized date according to language locale', () => {
    const faDate = formatLocalizedDate('2026-09-01', 'fa');
    expect(faDate).toContain('شهریور');

    const enDate = formatLocalizedDate('2026-09-01', 'en');
    expect(enDate).toContain('September');
    expect(enDate).toContain('2026');
  });

  it('correctly increments and decrements ISO dates across month and year boundaries', () => {
    expect(addDaysToISODate('2026-09-01', 1)).toBe('2026-09-02');
    expect(addDaysToISODate('2026-09-01', -1)).toBe('2026-08-31');
    expect(addDaysToISODate('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('validates today status', () => {
    const today = getTodayISO();
    expect(isToday(today)).toBe(true);
    expect(isToday('2000-01-01')).toBe(false);
  });
});
