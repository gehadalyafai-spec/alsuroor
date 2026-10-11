import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../students/data/circle_repository.dart';
import '../../students/domain/student.dart';
import '../domain/recitation_plan.dart';

enum WorkspaceMode { recitation, review, reports, mushaf }

class WorkspaceScreen extends ConsumerStatefulWidget {
  const WorkspaceScreen({super.key, required this.mode});
  final WorkspaceMode mode;

  @override
  ConsumerState<WorkspaceScreen> createState() => _WorkspaceScreenState();
}

class _WorkspaceScreenState extends ConsumerState<WorkspaceScreen> {
  String? selectedId;
  int? targetRub;

  @override
  Widget build(BuildContext context) {
    final names = {
      WorkspaceMode.recitation: 'التسميع',
      WorkspaceMode.review: 'المراجعة والورد',
      WorkspaceMode.reports: 'التقارير',
      WorkspaceMode.mushaf: 'المصحف',
    };
    return Scaffold(
      appBar: AppBar(title: Text(names[widget.mode]!)),
      body: widget.mode == WorkspaceMode.mushaf
          ? _mushafNotice(context)
          : ref.watch(circleStudentsProvider).when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => _errorState(error),
              data: (students) => _content(context, students),
            ),
    );
  }

  Widget _errorState(Object error) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off_outlined, size: 46),
            const SizedBox(height: 12),
            const Text('تعذر قراءة بيانات الحلقة'),
            const SizedBox(height: 8),
            SelectableText('$error', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            FilledButton.tonal(
              onPressed: () => ref.invalidate(circleStudentsProvider),
              child: const Text('إعادة المحاولة'),
            ),
          ]),
        ),
      );

  Widget _content(BuildContext context, List<Student> students) {
    if (students.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'لم تُرجع الوثيقة الحالية بيانات طلاب. نحتاج إلى مطابقة مسار الحلقة مع الموقع الأصلي قبل عرض سجلاته.',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    if (widget.mode == WorkspaceMode.reports) return _reports(students);

    final validSelection = students.any((student) => student.id == selectedId);
    final selected = validSelection
        ? students.firstWhere((student) => student.id == selectedId)
        : students.first;
    final rub = targetRub ?? selected.currentRub;
    final plan = buildRecitationPlan(rub);

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _notice(),
        const SizedBox(height: 18),
        Text('اختر الطالب', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          key: ValueKey(selected.id),
          initialValue: selected.id,
          isExpanded: true,
          items: students.map((student) => DropdownMenuItem(
            value: student.id, child: Text(student.name, overflow: TextOverflow.ellipsis),
          )).toList(),
          onChanged: (value) => setState(() { selectedId = value; targetRub = null; }),
        ),
        const SizedBox(height: 18),
        _stat('الربع الحالي المسجل', '${selected.currentRub} من 240'),
        const SizedBox(height: 12),
        if (widget.mode == WorkspaceMode.recitation) ...[
          Text('الربع المستهدف للتسميع', style: Theme.of(context).textTheme.titleMedium),
          Slider(
            value: rub.toDouble(),
            min: 1, max: 240, divisions: 239,
            label: '$rub',
            onChanged: (value) => setState(() => targetRub = value.round()),
          ),
          Text('الربع $rub', textAlign: TextAlign.center),
          const SizedBox(height: 12),
          _stat('الربع الجديد', '${plan.newRub}'),
          const SizedBox(height: 10),
          _stat('أرباع الربط', plan.linkingRubs.isEmpty
              ? 'لا يوجد قبل الربع الأول'
              : plan.linkingRubs.join('، ')),
          const SizedBox(height: 10),
          _stat('خطة التسميع التجريبية', plan.allRubs.join(' ← ')),
        ] else ...[
          _stat('الأرباع المكتملة بحسب السجل', '${selected.completedRubCount}'),
          const SizedBox(height: 12),
          _stat('مراجعة مقترحة للتخطيط', plan.linkingRubs.isEmpty
              ? 'البدء بالربع الأول'
              : 'الأرباع ${plan.linkingRubs.join('، ')}'),
        ],
        const SizedBox(height: 18),
        const Text(
          'هذه أداة عرض وتخطيط محلية فقط. لا تُسجل جلسة أو نتيجة ولا تغيّر مستوى الحفظ في Firebase.',
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _reports(List<Student> students) {
    final active = students.where((student) => student.status == 'active').length;
    final completed = students.fold<int>(
      0, (sum, student) => sum + student.completedRubCount,
    );
    return ListView(padding: const EdgeInsets.all(20), children: [
      _notice(),
      const SizedBox(height: 18),
      _stat('طلاب الوثيقة المتاحة', '${students.length}'),
      const SizedBox(height: 12),
      _stat('الحالة النشطة', '$active'),
      const SizedBox(height: 12),
      _stat('مجموع الأرباع المكتملة بحسب السجلات', '$completed'),
      const SizedBox(height: 18),
      Text('ملخص الطلاب', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 8),
      ...students.map((student) => Card(
        child: ListTile(
          title: Text(student.name),
          subtitle: Text('الربع الحالي: ${student.currentRub}'),
          trailing: Text('${student.completedRubCount}/240'),
        ),
      )),
      const SizedBox(height: 12),
      const Text('هذه إحصاءات من قائمة الطلاب فقط، وليست تقرير حضور أو تسميع معتمدًا.'),
    ]);
  }

  Widget _notice() => Card(
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Row(children: [
        const Icon(Icons.verified_user_outlined),
        const SizedBox(width: 12),
        const Expanded(
          child: Text('وضع القراءة الآمن: لا توجد عمليات كتابة أو اعتماد نتائج على بيانات الموقع.'),
        ),
      ]),
    ),
  );

  Widget _stat(String title, String value) => Card(
    child: Padding(
      padding: const EdgeInsets.all(18),
      child: Row(children: [
        Expanded(child: Text(title)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ]),
    ),
  );

  Widget _mushafNotice(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.menu_book_rounded, size: 72,
          color: Theme.of(context).colorScheme.primary),
        const SizedBox(height: 18),
        Text('المصحف القرآني', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        const Text(
          'المصحف غير متاح في نسخة Flutter بعد. لن نعرض نصوصًا قرآنية من مصدر غير مُتحقق منه. سنربطه بالمصدر المعتمد قبل تفعيله.',
          textAlign: TextAlign.center,
        ),
      ]),
    ),
  );
}
