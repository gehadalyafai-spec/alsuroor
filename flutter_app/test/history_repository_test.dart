import 'package:alsuroor_flutter/features/history/data/history_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('empty legacy document stays empty', () {
    final history = CircleHistory.fromMap(null);
    expect(history.documentExists, false);
    expect(history.sessions, isEmpty);
    expect(history.revisions, isEmpty);
  });

  test('legacy records are read without changing values', () {
    final history = CircleHistory.fromMap({
      'sessionRecords': [
        {
          'studentId': 's1',
          'date': '2026-10-11',
          'newRub': 12,
          'grade': 'excellent',
          'mistakesCount': 2,
          'hesitationsCount': 1,
          'teacherNotes': 'مراجعة',
          'advancedToNext': true,
        }
      ],
      'dailyRevisionRecords': [
        {
          'studentId': 's1',
          'date': '2026-10-10',
          'assignedCount': 5,
          'status': 'completed',
          'rating': 4,
          'verifiedByTeacher': true,
        }
      ],
    });
    expect(history.sessions.single.newRub, 12);
    expect(history.sessions.single.mistakes, 2);
    expect(history.sessions.single.advanced, isTrue);
    expect(history.revisions.single.count, 5);
    expect(history.revisions.single.verified, isTrue);
  });
}
