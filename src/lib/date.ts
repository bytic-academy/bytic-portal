export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

export const JALALI_MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_MONTH_NAMES_EN = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
] as const;

export const PERSIAN_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
] as const;

export const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Converts Western digits to Persian digits.
 */
export function toPersianDigits(input: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (d) => persianDigits[+d]);
}

/**
 * Converts Gregorian date (year, month 1-12, day 1-31) to Jalali (Solar Hijri).
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/**
 * Converts Jalali date (year, month 1-12, day 1-31) to Gregorian.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  const jy2 = jy + 1595;
  let days =
    -355668 +
    365 * jy2 +
    Math.floor(jy2 / 33) * 8 +
    Math.floor(((jy2 % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  const gd = days + 1;
  return { gy, gm, gd };
}

/**
 * Returns today's ISO date string in YYYY-MM-DD format (local time).
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a Date object at local midnight.
 */
export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds or subtracts days to an ISO YYYY-MM-DD date.
 */
export function addDaysToISODate(isoDate: string, days: number): string {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}

/**
 * Checks if a given ISO YYYY-MM-DD is today.
 */
export function isToday(isoDate: string): boolean {
  return isoDate === getTodayISO();
}

/**
 * Formats ISO YYYY-MM-DD into full Persian date: e.g. "دوشنبه ۲ شهریور ۱۴۰۵"
 */
export function formatJalaliFull(isoDate: string): string {
  const date = parseISODate(isoDate);
  const { jy, jm, jd } = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  const weekday = PERSIAN_WEEKDAYS[date.getDay()];
  const monthName = JALALI_MONTH_NAMES_FA[jm - 1];
  return `${weekday} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

/**
 * Formats ISO YYYY-MM-DD into short Jalali string: e.g. "۱۴۰۵/۰۶/۰۲"
 */
export function formatJalaliShort(isoDate: string): string {
  const date = parseISODate(isoDate);
  const { jy, jm, jd } = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  const mm = String(jm).padStart(2, '0');
  const dd = String(jd).padStart(2, '0');
  return toPersianDigits(`${jy}/${mm}/${dd}`);
}

/**
 * Formats ISO YYYY-MM-DD based on locale ('fa' or 'en').
 */
export function formatLocalizedDate(isoDate: string, locale: 'fa' | 'en' = 'fa'): string {
  if (locale === 'fa') {
    return formatJalaliFull(isoDate);
  }
  const date = parseISODate(isoDate);
  const weekday = ENGLISH_WEEKDAYS[date.getDay()];
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}
