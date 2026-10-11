import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_gate_screen.dart';
import '../../features/students/presentation/students_screen.dart';
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
      ...WorkspaceMode.values.map((mode) => GoRoute(
        path: '/workspace/${mode.name}',
        builder: (context, state) => WorkspaceScreen(mode: mode),
      )),
      GoRoute(
        path: '/students',
        builder: (context, state) => const StudentsScreen(),
        routes: [
          GoRoute(
            path: ':studentId',
            builder: (context, state) => StudentDetailScreen(
              studentId: state.pathParameters['studentId'] ?? '',
            ),
          ),
        ],
      ),
    ],
  );
});
