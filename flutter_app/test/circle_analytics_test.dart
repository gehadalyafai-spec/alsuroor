import 'package:alsuroor_flutter/features/analytics/domain/circle_analytics.dart';
import 'package:alsuroor_flutter/features/history/data/history_repository.dart';
import 'package:alsuroor_flutter/features/students/domain/student.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('analytics counts actual legacy events, not estimates', () {
    final student = Student.fromMap({
      'id': 's1', 'name': 'طالب', 'status': 'active',
      'currentRub': 4, 'completedRubCount': 3,
    });
    final history = CircleHistory.fromMap({
      'sessionRecords': [
        {'studentId': 's1', 'date': '2026-10-09', 'newRub': 3},
        {'studentId': 's1', 'date': '2026-10-11', 'newRub': 4},
      ],
      'dailyRevisionRecords': [
        {'studentId': 's1', 'date': '2026-10-10',
         'status': 'completed', 'verifiedByTeacher': true},
        {'studentId': 's1', 'date': '2026-10-08',
         'status': 'pending', 'verifiedByTeacher': false},
      ],
    });
    final analytics = CircleAnalytics.calculate([student], history);
    expect(analytics.students, 1);
    expect(analytics.activeStudents, 1);
    expect(analytics.sessions, 2);
    expect(analytics.studentsWithSessions, 1);
    expect(analytics.revisions, 2);
    expect(analytics.completedRevisions, 1);
    expect(analytics.verifiedRevisions, 1);
    expect(analytics.latestSessionDate, '2026-10-11');
  });

  test('no records returns safe empty analytics', () {
    final analytics = CircleAnalytics.calculate([], CircleHistory.fromMap(null));
    expect(analytics.sessions, 0);
    expect(analytics.latestRevisionDate, isNull);
  });
}
