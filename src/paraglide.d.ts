declare module '@/paraglide/messages' {
  export const m: {
    app_title: () => string;
    app_subtitle: () => string;
    search_placeholder: () => string;
    filter_all: () => string;
    filter_scratch_jr: () => string;
    filter_scratch: () => string;
    filter_web_design: () => string;
    filter_python: () => string;
    tab_overview: () => string;
    tab_attendance: () => string;
    tab_students: () => string;
    tab_reports: () => string;
    stat_total_students: () => string;
    stat_present_today: () => string;
    stat_absent_today: () => string;
    stat_late_today: () => string;
    stat_attendance_rate: () => string;
    btn_check_in: () => string;
    btn_check_out: () => string;
    btn_mark_absent: () => string;
    btn_mark_justified: () => string;
    btn_export: () => string;
    btn_add_student: () => string;
    btn_save: () => string;
    btn_cancel: () => string;
    status_present: () => string;
    status_absent: () => string;
    status_late: () => string;
    status_justified: () => string;
    col_student: () => string;
    col_student_id: () => string;
    col_course: () => string;
    col_time: () => string;
    col_status: () => string;
    col_actions: () => string;
    theme_light: () => string;
    theme_dark: () => string;
    theme_system: () => string;
    lang_persian: () => string;
    lang_english: () => string;
    quick_status_update: () => string;
    student_name_label: () => string;
    course_label: () => string;
    national_id_label: () => string;
    guardian_phone_label: () => string;
    today_date: () => string;
    live_session_alert: () => string;
    rtl_ltr_badge: () => string;
    powered_by: () => string;
    [key: string]: (...args: any[]) => string;
  };
}

declare module '@/paraglide/runtime' {
  export const baseLocale: 'fa';
  export const locales: readonly ['fa', 'en'];
  export type Locale = 'fa' | 'en';
  export function getLocale(): 'fa' | 'en';
  export function setLocale(newLocale: 'fa' | 'en', options?: { reload?: boolean }): void;
  export function getTextDirection(locale?: 'fa' | 'en'): 'ltr' | 'rtl';
}
