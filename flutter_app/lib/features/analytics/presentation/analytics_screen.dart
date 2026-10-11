import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../history/data/history_repository.dart';
import '../../students/data/circle_repository.dart';
import '../domain/circle_analytics.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final students = ref.watch(circleStudentsProvider);
    final history = ref.watch(circleHistoryProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة إحصاءات الحلقة'),
        actions: [
          IconButton(
            tooltip: 'تحديث',
            onPressed: () {
              ref.invalidate(circleStudentsProvider);
              ref.invalidate(circleHistoryProvider);
            },
            icon: const Icon(Icons.refresh),
          )
        ],
      ),
      body: students.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: SelectableText('خطأ تحميل الطلاب: $e')),
        data: (items) => history.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: SelectableText('خطأ تحميل السجلات: $e')),
          data: (historyData) {
            final data = CircleAnalytics.calculate(items, historyData);
            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('إحصاءات مباشرة للقراءة فقط من وثيقة الحلقة المرتبطة بالحساب الحالي؛ لا تتضمن سجلات أخرى خارجها.'),
                  ),
                ),
                if (!historyData.documentExists)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(14),
                      child: Text('وثيقة بيانات الحلقة غير موجودة لهذا الحساب؛ لا تُعد القيم الصفرية دليلًا على خلو الموقع من البيانات.'),
                    ),
                  ),
                const SizedBox(height: 12),
                _Metric(title: 'الطلاب', value: data.students.toString(), icon: Icons.groups_outlined),
                _Metric(title: 'الطلاب النشطون', value: data.activeStudents.toString(), icon: Icons.verified_outlined),
                _Metric(title: 'جلسات التسميع', value: data.sessions.toString(), icon: Icons.mic_none),
                _Metric(title: 'طلاب لديهم جلسات', value: data.studentsWithSessions.toString(), icon: Icons.person_search_outlined),
                _Metric(title: 'سجلات المراجعة', value: data.revisions.toString(), icon: Icons.fact_check_outlined),
                _Metric(title: 'مراجعات مكتملة', value: data.completedRevisions.toString(), icon: Icons.done_all),
                _Metric(title: 'مراجعات معتمدة', value: data.verifiedRevisions.toString(), icon: Icons.task_alt_outlined),
                const SizedBox(height: 18),
                Text('آخر نشاط', style: Theme.of(context).textTheme.titleLarge),
                ListTile(title: const Text('آخر تسميع'), subtitle: Text(data.latestSessionDate ?? 'لا توجد جلسات')),
                ListTile(title: const Text('آخر مراجعة'), subtitle: Text(data.latestRevisionDate ?? 'لا توجد مراجعات')),
                const SizedBox(height: 14),
                OutlinedButton.icon(
                  onPressed: () => context.push('/history/sessions'),
                  icon: const Icon(Icons.history),
                  label: const Text('عرض سجل التسميع'),
                ),
                OutlinedButton.icon(
                  onPressed: () => context.push('/history/revisions'),
                  icon: const Icon(Icons.list_alt),
                  label: const Text('عرض سجل المراجعة'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.title, required this.value, required this.icon});
  final String title;
  final String value;
  final IconData icon;
  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          child: Row(children: [
            Icon(icon),
            const SizedBox(width: 16),
            Expanded(child: Text(title)),
            Text(value, style: Theme.of(context).textTheme.titleLarge),
          ]),
        ),
      );
}
