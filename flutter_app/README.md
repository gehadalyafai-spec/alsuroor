# جامع السرور — Flutter rebuild

هذا المجلد هو بداية إعادة بناء تطبيق جامع السرور كتطبيق Flutter أصلي، مع الحفاظ على مشروع الويب الحالي في جذر المستودع أثناء النقل المرحلي.

## المنفذ في هذه المرحلة

- Firebase Authentication بالبريد وكلمة المرور.
- بوابة دخول تعتمد على جلسة Firebase الحقيقية بدل رمز مشرف سري داخل الواجهة.
- لوحة رئيسية عربية RTL.
- قراءة الطلاب الحاليين من `users/{uid}/circleData/main`.
- إضافة طالب جديد مع رمز وصول فريد.
- منطق خطة التسميع: الربع الجديد + ثلاثة أرباع سابقة بحد أقصى.
- Riverpod + GoRouter.

## إعداد ملفات المنصات

```powershell
cd flutter_app
flutter create . --platforms=android,ios,web --org com.alyafai
flutter pub get
dart pub global activate flutterfire_cli
flutterfire configure --project=alsuroor-app
```

لا تنشر قواعد Firestore القديمة المفتوحة. راجع `../FLUTTER_MIGRATION_AUDIT.md`.
