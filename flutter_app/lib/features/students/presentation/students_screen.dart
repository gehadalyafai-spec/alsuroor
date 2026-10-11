import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../data/circle_repository.dart';

class StudentsScreen extends ConsumerWidget {
  const StudentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).value;
    final students = ref.watch(circleStudentsProvider);

    if (user == null) {
      return const Scaffold(body: Center(child: Text('يلزم تسجيل الدخول أولًا')));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('الطلاب')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('إضافة الطلاب متوقفة مؤقتًا لحماية البيانات حتى اكتمال التحقق من الصلاحيات.')),
        ),
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('إضافة طالب (قريبًا)'),
      ),
      body: students.when(
        data: (items) {
          if (items.isEmpty) return const Center(child: Padding(
            padding: EdgeInsets.all(24),
            child: Text('لم تُرجع وثيقة الحلقة المرتبطة بحسابك أي طلاب. قد تكون بيانات الموقع محفوظة في مسار آخر، ولا يعني ذلك عدم وجود طلاب في النظام.', textAlign: TextAlign.center),
          ));

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final student = items[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      student.name.trim().isEmpty ? '؟' : student.name.trim()[0],
                    ),
                  ),
                  title: Text(
                    student.name,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  subtitle: Text(
                    'الربع ${student.currentRub}',
                  ),
                  trailing: const Icon(Icons.chevron_left_rounded),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('تعذر تحميل الطلاب:\n$error', textAlign: TextAlign.center),
          ),
        ),
      ),
    );
  }
}
