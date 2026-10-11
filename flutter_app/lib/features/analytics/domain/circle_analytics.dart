import '../../history/data/history_repository.dart';
import '../../students/domain/student.dart';

class CircleAnalytics {
  const CircleAnalytics({
    required this.students,
    required this.sessions,
    required this.revisions,
    required this.activeStudents,
    required this.studentsWithSessions,
    required this.completedRevisions,
    required this.verifiedRevisions,
    required this.latestSessionDate,
    required this.latestRevisionDate,
  });

  final int students;
  final int sessions;
  final int revisions;
  final int activeStudents;
  final int studentsWithSessions;
  final int completedRevisions;
  final int verifiedRevisions;
  final String? latestSessionDate;
  final String? latestRevisionDate;

  static CircleAnalytics calculate(
      List<Student> students, CircleHistory history) {
    final sessionIds = history.sessions.map((entry) => entry.studentId).toSet();
    final dates = history.sessions.map((entry) => entry.date)
        .where((date) => date.isNotEmpty).toList()..sort();
    final revisionDates = history.revisions.map((entry) => entry.date)
        .where((date) => date.isNotEmpty).toList()..sort();

    return CircleAnalytics(
      students: students.length,
      sessions: history.sessions.length,
      revisions: history.revisions.length,
      activeStudents: students.where((s) => s.status == 'active').length,
      studentsWithSessions: students.where((s) => sessionIds.contains(s.id)).length,
      completedRevisions: history.revisions
          .where((entry) => entry.status == 'completed').length,
      verifiedRevisions: history.revisions
          .where((entry) => entry.verified).length,
      latestSessionDate: dates.isEmpty ? null : dates.last,
      latestRevisionDate: revisionDates.isEmpty ? null : revisionDates.last,
    );
  }
}
