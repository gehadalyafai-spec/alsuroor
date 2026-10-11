import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/circle_repository.dart';

class StudentDetailScreen extends ConsumerWidget {
  const StudentDetailScreen({super.key, required this.studentId});

  final String studentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final students = ref.watch(circleStudentsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('ملف الطالب')),
      body: students.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('تعذر تحميل بيانات الطالب: $error')),
        data: (items) {
          final matches = items.where((item) => item.id == studentId);
          if (matches.isEmpty) {
            return const Center(child: Text('لم يتم العثور على الطالب في بيانات هذه الحلقة'));
          }
          final student = matches.first;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              CircleAvatar(
                radius: 36,
                child: Text(student.name.isEmpty ? '؟' : student.name[0],
                    style: const TextStyle(fontSize: 28)),
              ),
              const SizedBox(height: 16),
              Text(student.name,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 20),
              _InfoTile(title: 'الربع الحالي', value: '${student.currentRub}'),
              _InfoTile(title: 'الأرباع المكتملة', value: '${student.completedRubCount}'),
              _InfoTile(title: 'تاريخ الانضمام', value: student.joinDate.isEmpty ? 'غير متوفر' : student.joinDate),
              _InfoTile(title: 'الحالة', value: student.status),
              if (student.notes.trim().isNotEmpty)
                _InfoTile(title: 'ملاحظات', value: student.notes),
              const SizedBox(height: 16),
              const Text(
                'عرض للقراءة فقط. لا يمكن تعديل بيانات الطالب حتى استكمال التحقق من الصلاحيات وتوافق بنية البيانات مع موقع الويب.',
                textAlign: TextAlign.center,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.title, required this.value});
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
