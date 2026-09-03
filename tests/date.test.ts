import { describe, it, expect } from 'vitest';
import {
  gregorianToJalali,
  jalaliToGregorian,
  toPersianDigits,
  formatJalaliFull,
  formatJalaliShort,
  formatLocalizedDate,
  formatJalaliMedium,
  formatLocalizedTime,
  formatLocalizedDateTime,
  getJalaliTodayDetails,
  parseJalaliToISO,
  calculateAge,
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

  it('formats medium and short Jalali date strings', () => {
    const medium = formatJalaliMedium('2026-09-01');
    expect(medium).toBe('۱۰ شهریور ۱۴۰۵');

    const formatted = formatJalaliShort('2026-09-01');
    expect(formatted).toBe('۱۴۰۵/۰۶/۱۰');
  });

  it('formats 24h time with Persian numerals', () => {
    expect(formatLocalizedTime('10:30')).toBe('۱۰:۳۰');
    expect(formatLocalizedTime('08:00:00')).toBe('۰۸:۰۰');
    expect(formatLocalizedTime('')).toBe('');
  });

  it('formats ISO UTC timestamps to localized Jalali date and time', () => {
    const utcIso = '2026-09-01T10:30:00.000Z';
    const formatted = formatLocalizedDateTime(utcIso);
    expect(formatted).toContain('شهریور');
    expect(formatted).toContain('۱۴۰۵');
    expect(formatted).toContain('ساعت');
  });

  it('provides detailed Jalali today information', () => {
    const todayDetails = getJalaliTodayDetails();
    expect(todayDetails.jy).toBeGreaterThan(1400);
    expect(todayDetails.jm).toBeGreaterThanOrEqual(1);
    expect(todayDetails.jm).toBeLessThanOrEqual(12);
    expect(todayDetails.fullFormatted).toContain(todayDetails.monthName);
  });

  it('parses Jalali date string back to ISO Gregorian correctly', () => {
    expect(parseJalaliToISO('1405/06/10')).toBe('2026-09-01');
    expect(parseJalaliToISO('۱۴۰۵/۰۶/۱۰')).toBe('2026-09-01');
    expect(parseJalaliToISO('1405-01-01')).toBe('2026-03-21');
    expect(parseJalaliToISO('invalid-date')).toBeNull();
  });

  it('calculates student age correctly from ISO birthdate', () => {
    const age = calculateAge('2010-01-01');
    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThanOrEqual(14);
    expect(calculateAge('')).toBeNull();
  });

  it('formats localized date according to language locale and style', () => {
    const faDate = formatLocalizedDate('2026-09-01', 'fa');
    expect(faDate).toContain('شهریور');

    const faMedium = formatLocalizedDate('2026-09-01', 'fa', 'medium');
    expect(faMedium).toBe('۱۰ شهریور ۱۴۰۵');

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
