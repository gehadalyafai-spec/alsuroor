import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import '../data/supervisor_access.dart';

class ProtectedScreen extends ConsumerWidget {
  const ProtectedScreen({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    return auth.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, _) => Scaffold(body: Center(child: Text('خطأ المصادقة: $error'))),
      data: (user) {
        if (user == null) {
          return const Scaffold(body: Center(child: Text('يلزم تسجيل الدخول من الصفحة الرئيسية')));
        }
        final access = ref.watch(supervisorAccessProvider);
        return access.when(
          loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
          error: (error, _) => Scaffold(body: Center(child: Text('تعذر التحقق من الصلاحية: $error'))),
          data: (allowed) => allowed
              ? child
              : Scaffold(
                  appBar: AppBar(title: const Text('صلاحية المشرف')),
                  body: const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('يلزم اعتماد صلاحية المشرف من الخادم قبل عرض البيانات.',
                        textAlign: TextAlign.center),
                    ),
                  ),
                ),
        );
      },
    );
  }
}
