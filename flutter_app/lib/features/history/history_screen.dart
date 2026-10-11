import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../students/data/circle_repository.dart';
import 'data/history_repository.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key, required this.showRevisions});
  final bool showRevisions;

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  String? selectedStudent;
  DateTime? selectedDate;

  @override
  Widget build(BuildContext context) {
    final history = ref.watch(circleHistoryProvider);
    final students = ref.watch(circleStudentsProvider);
    final title = widget.showRevisions ? 'سجل المراجعة والورد' : 'سجل التسميع';

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            tooltip: 'تحديث',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              ref.invalidate(circleHistoryProvider);
              ref.invalidate(circleStudentsProvider);
            },
          ),
        ],
      ),
      body: history.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorState(error: error),
        data: (data) {
          final names = students.value?.fold<Map<String, String>>(
                <String, String>{},
                (map, student) => map..[student.id] = student.name,
              ) ??
              <String, String>{};

          final entries = <_HistoryRow>[
            if (widget.showRevisions)
              for (final item in data.revisions)
                _HistoryRow(
                  studentId: item.studentId,
                  date: item.date,
                  title: 'مراجعة ${item.count} ربع',
                  subtitle: 'الحالة: ${item.status} | التقييم: ${item.rating?.toString() ?? '—'}'
                      ' | اعتماد المعلم: ${item.verified ? 'نعم' : 'لا'}',
                  notes: item.notes,
                )
            else
              for (final item in data.sessions)
                _HistoryRow(
                  studentId: item.studentId,
                  date: item.date,
                  title: 'تسميع الربع ${item.newRub}',
                  subtitle: 'التقدير: ${item.grade} | الأخطاء: ${item.mistakes}'
                      ' | التردد: ${item.hesitations} | تقدم: ${item.advanced ? 'نعم' : 'لا'}',
                  notes: item.notes,
                ),
          ];
          entries.sort((a, b) => b.date.compareTo(a.date));
          final ids = entries.map((e) => e.studentId).where((s) => s.isNotEmpty).toSet().toList()..sort();
          final activeStudent = ids.contains(selectedStudent) ? selectedStudent : null;
          final selectedDateKey = selectedDate == null
              ? null
              : '${selectedDate!.year.toString().padLeft(4, '0')}-'
                  '${selectedDate!.month.toString().padLeft(2, '0')}-'
                  '${selectedDate!.day.toString().padLeft(2, '0')}';
          final filtered = entries.where((item) =>
            (activeStudent == null || item.studentId == activeStudent) &&
            (selectedDateKey == null || item.date == selectedDateKey)
          ).toList(growable: false);

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(14),
                  child: Text('هذه السجلات تُقرأ من Firebase دون إجراء أي تعديل أو اعتماد.'),
                ),
              ),
              const SizedBox(height: 12),
              if (!data.documentExists)
                const Padding(
                  padding: EdgeInsets.all(12),
                  child: Text('وثيقة الحلقة غير موجودة تحت الحساب الحالي. تحقق من الحساب المستخدم في موقع الويب الأصلي.'),
                ),
              Row(children: [
                Expanded(
                  child: _Metric(title: 'السجلات', value: '${entries.length}'),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _Metric(title: 'بعد التصفية', value: '${filtered.length}'),
                ),
              ]),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                key: ValueKey(activeStudent ?? 'all'),
                initialValue: activeStudent ?? '',
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'الطالب'),
                items: [
                  const DropdownMenuItem(value: '', child: Text('جميع الطلاب')),
                  for (final id in ids)
                    DropdownMenuItem(
                      value: id,
                      child: Text(names[id] ?? 'طالب ($id)', overflow: TextOverflow.ellipsis),
                    ),
                ],
                onChanged: (id) => setState(() => selectedStudent = id == '' ? null : id),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: selectedDate ?? DateTime.now(),
                    firstDate: DateTime(2000),
                    lastDate: DateTime(2100),
                  );
                  if (date != null && mounted) setState(() => selectedDate = date);
                },
                icon: const Icon(Icons.calendar_month_outlined),
                label: Text(selectedDateKey ?? 'تصفية بالتاريخ'),
              ),
              if (selectedDate != null)
                TextButton(
                  onPressed: () => setState(() => selectedDate = null),
                  child: const Text('مسح تصفية التاريخ'),
                ),
              const SizedBox(height: 12),
              if (filtered.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: Text('لا توجد سجلات مطابقة للتصفية')),
                ),
              for (final item in filtered)
                Card(
                  margin: const EdgeInsets.only(bottom: 9),
                  child: ListTile(
                    title: Text(names[item.studentId] ?? 'طالب (${item.studentId})',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.title),
                        Text(item.subtitle),
                        if (item.notes.trim().isNotEmpty) Text('ملاحظات: ${item.notes}'),
                      ],
                    ),
                    trailing: Text(item.date),
                    isThreeLine: true,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _HistoryRow {
  const _HistoryRow({
    required this.studentId,
    required this.date,
    required this.title,
    required this.subtitle,
    required this.notes,
  });
  final String studentId;
  final String date;
  final String title;
  final String subtitle;
  final String notes;
}

class _Metric extends StatelessWidget {
  const _Metric({required this.title, required this.value});
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(children: [
            Text(value, style: Theme.of(context).textTheme.headlineMedium),
            Text(title),
          ]),
        ),
      );
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error});
  final Object error;
  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: SelectableText('تعذر تحميل السجلات من Firebase:\n$error',
              textAlign: TextAlign.center),
        ),
      );
}
