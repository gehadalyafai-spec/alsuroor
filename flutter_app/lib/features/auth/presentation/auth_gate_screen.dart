import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../home/presentation/home_screen.dart';
import '../data/auth_repository.dart';
import '../data/supervisor_access.dart';
import 'login_screen.dart';

class AuthGateScreen extends ConsumerWidget {
  const AuthGateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);

    return auth.when(
      data: (user) => user == null ? const LoginScreen() : const SupervisorGate(),
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'تعذر التحقق من جلسة الدخول.\n$error',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}

class SupervisorGate extends ConsumerWidget {
  const SupervisorGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final access = ref.watch(supervisorAccessProvider);
    return access.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      data: (allowed) => allowed
          ? const HomeScreen()
          : Scaffold(
              appBar: AppBar(title: const Text('التحقق من صلاحية المشرف')),
              body: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.admin_panel_settings_outlined, size: 56),
                    const SizedBox(height: 16),
                    const Text(
                      'تم تسجيل الدخول بنجاح، لكن الحساب لم يحصل بعد على صلاحية مشرف معتمدة من الخادم. لن نعرض بيانات الطلاب حتى اعتماد الحساب.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    OutlinedButton(
                      onPressed: () => ref.invalidate(supervisorAccessProvider),
                      child: const Text('إعادة التحقق'),
                    ),
                    TextButton(
                      onPressed: () => ref.read(authRepositoryProvider).signOut(),
                      child: const Text('تسجيل الخروج'),
                    ),
                  ]),
                ),
              ),
            ),
      error: (error, _) => Scaffold(
        appBar: AppBar(title: const Text('تعذر التحقق من الصلاحية')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              SelectableText('تعذر التحقق من صلاحية المشرف: $error'),
              TextButton(
                onPressed: () => ref.read(authRepositoryProvider).signOut(),
                child: const Text('تسجيل الخروج'),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}
