import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_gate_screen.dart';
import '../../features/auth/presentation/protected_screen.dart';
import '../../features/students/presentation/students_screen.dart';
import '../../features/history/history_screen.dart';
import '../../features/analytics/presentation/analytics_screen.dart';
import '../../features/students/presentation/student_detail_screen.dart';
import '../../features/sessions/presentation/workspace_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const AuthGateScreen(),
      ),
      GoRoute(
        path: '/analytics',
        builder: (context, state) => const ProtectedScreen(child: AnalyticsScreen()),
      ),
      GoRoute(
        path: '/history/sessions',
        builder: (context, state) => const ProtectedScreen(child: HistoryScreen(showRevisions: false)),
      ),
      GoRoute(
        path: '/history/revisions',
        builder: (context, state) => const ProtectedScreen(child: HistoryScreen(showRevisions: true)),
      ),
      ...WorkspaceMode.values.map((mode) => GoRoute(
        path: '/workspace/${mode.name}',
        builder: (context, state) => ProtectedScreen(child: WorkspaceScreen(mode: mode)),
      )),
      GoRoute(
        path: '/students',
        builder: (context, state) => const ProtectedScreen(child: StudentsScreen()),
        routes: [
          GoRoute(
            path: ':studentId',
            builder: (context, state) => ProtectedScreen(child: StudentDetailScreen(
              studentId: state.pathParameters['studentId'] ?? '',
            )),
          ),
        ],
      ),
    ],
  );
});
