# ExportOS Landing Page

صفحه فرود HTML فارسی بر اساس [Ohio Demo 5](https://ohio.clbthemes.com/demo5/homedemo5-elementor/) — بهینه‌شده برای سئو و سرعت.

## ساختار

```
public/
├── index.html          # صفحه اصلی
├── css/main.css        # استایل‌ها (RTL + Dark Mode)
├── js/main.js          # تعاملات (آماده Alpine.js)
├── assets/
│   ├── fonts/          # فونت یکان باخ (مرحله بعد)
│   └── images/         # تصاویر
├── robots.txt
└── sitemap.xml
```

## پیش‌نمایش

```bash
cd public && python3 -m http.server 8080
```

سپس به `http://localhost:8080` بروید.

## مراحل بعدی

1. اضافه کردن فونت یکان باخ به `public/assets/fonts/`
2. تبدیل به Blade/Livewire
3. اتصال فرم به Laravel backend
4. پنل مدیریت Filament
