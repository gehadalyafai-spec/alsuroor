import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../data/circle_repository.dart';

class StudentsScreen extends ConsumerWidget {
  const StudentsScreen({super.key});

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final parentPhone = TextEditingController();
    final rub = TextEditingController(text: '1');

    try {
      final shouldSave = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('إضافة طالب'),
          content: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: name,
                  autofocus: true,
                  decoration: const InputDecoration(labelText: 'اسم الطالب'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'هاتف الطالب'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: parentPhone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'هاتف ولي الأمر'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: rub,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الربع الحالي (1 - 240)'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('حفظ'),
            ),
          ],
        ),
      );

      if (shouldSave != true || name.text.trim().isEmpty) return;
      final uid = ref.read(authStateProvider).value?.uid;
      if (uid == null) return;

      await ref.read(circleRepositoryProvider).addLegacyStudent(
            uid: uid,
            name: name.text,
            phone: phone.text,
            parentPhone: parentPhone.text,
            currentRub: int.tryParse(rub.text) ?? 1,
          );
    } finally {
      name.dispose();
      phone.dispose();
      parentPhone.dispose();
      rub.dispose();
    }
  }

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
        onPressed: () => _showAddDialog(context, ref),
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('إضافة طالب'),
      ),
      body: students.when(
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('لا يوجد طلاب بعد'));

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
                    'الربع ${student.currentRub} • الرمز ${student.accessCode}',
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
