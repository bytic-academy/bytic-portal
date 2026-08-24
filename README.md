# Bytic Attendance System (سیستم مدیریت حضور و غیاب بایتک)

سامانه مدرن حضور و غیاب دانش‌آموزان برای **گروه آموزشی بایتک** ([bytic.ir](https://bytic.ir)).

---

## 🛠️ پشته فناوری / Tech Stack

- **React 19** (`react@^19.0.0`, `react-dom@^19.0.0`)
- **Vite 6** & **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Shadcn UI** (طراحی شده با کامپوننت‌های دسترس‌پذیر و سازگار با React 19)
- **Paraglide JS** (`@inlang/paraglide-js` برای ترجمه و بین‌المللی‌سازی در زمان کامپایل)
- **Vazirmatn Variable Font** (`@fontsource-variable/vazirmatn`)
- **OpenSpec Skills** (مستقر در پوشه `.agents/skills/` و `openspec/`)

---

## 🌟 ویژگی‌های کلیدی / Key Highlights

### ۱. معماری راست‌به‌چپ بدون وابستگی به واریانت‌های سخت‌کد شده (RTL-First)
تمام استایل‌ها و کامپوننت‌ها از **ویژگی‌های منطقی CSS (CSS Logical Properties)** بهره می‌برند:
- فاصله‌ها: `ms-*` (margin-inline-start), `me-*` (margin-inline-end), `ps-*`, `pe-*`
- موقعیت‌دهی: `start-*`, `end-*`
- تراز متن: `text-start`, `text-end`
- هیچ کلاس هاردکد شده `rtl:` یا `ltr:` استفاده نشده است و با تغییر زبان، کل چیدمان به صورت طبیعی معکوس می‌شود.

### ۲. پالت رنگ اختصاصی برگرفته از Bytic.ir
- رنگ اصلی (Primary Green): `#35b40e` (سبز اختصاصی بایتک)
- رنگ ثانویه (Coral / Crimson): `#fb4364`
- حالت تاریک (Dark Mode Slate):
  - پس‌زمینه بدنه: `#0e2338`
  - کارت‌ها و سطوح: `#1b344d`
  - هدر و منو: `#0f1e2f`
  - کادر و ورودی‌ها: `#1e3955`

### ۳. پشتیبانی از حالت تیره و روشن (Dark & Light Mode)
دارای `ThemeProvider` با امکان انتخاب حالت روشن، تاریک یا همگام با سیستم (System Default) همراه با ذخیره‌سازی در `localStorage`.

### ۴. چندزبانه با Paraglide JS (فارسی و انگلیسی)
- پیام‌ها در `messages/fa.json` و `messages/en.json` قرار دارند.
- تغییر زبان پویا از هدر برنامه همراه با تغییر تگ‌های `dir` و `lang` در ریشه سند.

### ۵. مهارت‌های OpenSpec در `.agents`
پروژه مجهز به مهارت‌های SDD (توسعه مشخصات‌محور) در `.agents/skills/` شامل:
- `openspec-explore`
- `openspec-propose`
- `openspec-apply`
- `openspec-archive`
- `openspec-validate`

---

## 🚀 نحوه اجرا و راه‌اندازی / Getting Started

```bash
# نصب وابستگی‌ها
pnpm install

# کامپایل پیام‌های چندزبانه Paraglide
pnpm run compile:i18n

# اجرای سرور توسعه
pnpm run dev

# ساخت بیلد نهایی برای پروداکشن
pnpm run build
```
