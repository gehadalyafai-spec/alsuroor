import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/data/auth_repository.dart';
import '../../students/data/circle_repository.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider).value;
    final students = ref.watch(circleStudentsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('جامع السرور', style: TextStyle(fontWeight: FontWeight.w900)),
            Text('حلقة القرآن الكريم', style: TextStyle(fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: () => ref.read(authRepositoryProvider).signOut(),
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(circleStudentsProvider);
          await ref.read(circleStudentsProvider.future);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'مرحبًا ${auth?.email?.split('@').first ?? 'بالمشرف'}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 6),
            const Text('هذه نسخة Flutter تجريبية. تسجيل الدخول يعمل، لكن نقل بيانات ووظائف موقع جامع السرور لم يكتمل بعد.'),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 12),
                    const Expanded(child: Text('عدد الطلاب أدناه يخص الوثيقة التي يحاول التطبيق قراءتها فقط، وليس بالضرورة إجمالي طلاب الموقع. إضافة وتعديل البيانات معطلان مؤقتًا لحماية السجلات.')),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            students.when(
              data: (items) => _SummaryCard(
                title: 'الطلاب',
                value: '${items.length}',
                subtitle: 'طلاب الوثيقة المرتبطة بالحساب',
                icon: Icons.groups_rounded,
                onTap: () => context.push('/students'),
              ),
              loading: () => const _SummaryCard(
                title: 'الطلاب',
                value: '…',
                subtitle: 'جارِ المزامنة',
                icon: Icons.groups_rounded,
              ),
              error: (error, stack) => _SummaryCard(
                title: 'الطلاب',
                value: '!',
                subtitle: 'تعذر تحميل البيانات',
                icon: Icons.error_outline_rounded,
                onTap: () => ref.invalidate(circleStudentsProvider),
              ),
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(child: _FeatureCard(title: 'التسميع', icon: Icons.record_voice_over_rounded)),
                SizedBox(width: 12),
                Expanded(child: _FeatureCard(title: 'الورد', icon: Icons.fact_check_rounded)),
              ],
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(child: _FeatureCard(title: 'التقارير', icon: Icons.insights_rounded)),
                SizedBox(width: 12),
                Expanded(child: _FeatureCard(title: 'المصحف', icon: Icons.menu_book_rounded)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    this.onTap,
  });

  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      color: colors.primaryContainer,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Icon(icon, size: 38, color: colors.onPrimaryContainer),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                    Text(subtitle),
                  ],
                ),
              ),
              Text(value, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({required this.title, required this.icon});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 30),
            const SizedBox(height: 14),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            const Text('سيُنقل في المرحلة التالية'),
          ],
        ),
      ),
    );
  }
}
