import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _registerMode = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final repo = ref.read(authRepositoryProvider);
      if (_registerMode) {
        await repo.register(email: _email.text, password: _password.text);
      } else {
        await repo.signIn(email: _email.text, password: _password.text);
      }
    } on FirebaseAuthException catch (error) {
      setState(() {
        _error = switch (error.code) {
          'invalid-credential' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          'email-already-in-use' => 'هذا البريد مسجل مسبقًا',
          'weak-password' => 'كلمة المرور ضعيفة',
          'invalid-email' => 'صيغة البريد الإلكتروني غير صحيحة',
          _ => error.message ?? 'تعذر تسجيل الدخول',
        };
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 38,
                    backgroundColor: colors.primaryContainer,
                    child: Icon(
                      Icons.menu_book_rounded,
                      size: 42,
                      color: colors.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'جامع السرور',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 6),
                  const Text('إدارة الحلقة القرآنية'),
                  const SizedBox(height: 28),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(
                      labelText: 'البريد الإلكتروني',
                      prefixIcon: Icon(Icons.mail_outline_rounded),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    onSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(
                      labelText: 'كلمة المرور',
                      prefixIcon: Icon(Icons.lock_outline_rounded),
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: TextStyle(color: colors.error)),
                  ],
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: FilledButton(
                      onPressed: _busy ? null : _submit,
                      child: _busy
                          ? const SizedBox.square(
                              dimension: 22,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(_registerMode ? 'إنشاء الحساب' : 'تسجيل الدخول'),
                    ),
                  ),
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () => setState(() {
                              _registerMode = !_registerMode;
                              _error = null;
                            }),
                    child: Text(
                      _registerMode
                          ? 'لديك حساب؟ سجّل الدخول'
                          : 'إنشاء حساب مشرف جديد',
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'نسخة Flutter لا تستخدم رمز مشرف سريًا مخزنًا داخل كود الواجهة.',
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
