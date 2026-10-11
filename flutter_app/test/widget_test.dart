import 'package:alsuroor_flutter/features/students/domain/student.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('legacy student data is normalized correctly', () {
    final student = Student.fromMap({
      'id': 'student-1',
      'name': 'طالب تجريبي',
      'phone': '',
      'parentPhone': '',
      'accessCode': 'STU-1001',
      'joinDate': '2026-10-11',
      'currentRub': 241,
      'completedRubCount': -1,
      'status': 'active',
      'notes': '',
    });

    expect(student.currentRub, 240);
    expect(student.completedRubCount, 0);
    expect(student.toMap()['accessCode'], 'STU-1001');
  });
}
