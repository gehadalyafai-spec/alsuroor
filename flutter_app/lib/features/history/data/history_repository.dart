import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../students/data/circle_repository.dart';

class RecitationEntry {
  const RecitationEntry({
    required this.studentId,
    required this.date,
    required this.newRub,
    required this.grade,
    required this.mistakes,
    required this.hesitations,
    required this.notes,
    required this.advanced,
  });
  final String studentId;
  final String date;
  final int newRub;
  final String grade;
  final int mistakes;
  final int hesitations;
  final String notes;
  final bool advanced;

  factory RecitationEntry.fromMap(Map<String, dynamic> data) => RecitationEntry(
        studentId: (data['studentId'] ?? '').toString(),
        date: (data['date'] ?? '').toString(),
        newRub: _asInt(data['newRub']),
        grade: (data['grade'] ?? 'غير محدد').toString(),
        mistakes: _asInt(data['mistakesCount']),
        hesitations: _asInt(data['hesitationsCount']),
        notes: (data['teacherNotes'] ?? '').toString(),
        advanced: data['advancedToNext'] == true,
      );
}

class RevisionEntry {
  const RevisionEntry({
    required this.studentId,
    required this.date,
    required this.count,
    required this.status,
    required this.rating,
    required this.verified,
    required this.notes,
  });
  final String studentId;
  final String date;
  final int count;
  final String status;
  final int? rating;
  final bool verified;
  final String notes;

  factory RevisionEntry.fromMap(Map<String, dynamic> data) => RevisionEntry(
        studentId: (data['studentId'] ?? '').toString(),
        date: (data['date'] ?? '').toString(),
        count: _asInt(data['assignedCount']),
        status: (data['status'] ?? 'غير محدد').toString(),
        rating: data['rating'] == null ? null : _asInt(data['rating']),
        verified: data['verifiedByTeacher'] == true,
        notes: (data['notes'] ?? '').toString(),
      );
}

int _asInt(Object? value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

class CircleHistory {
  const CircleHistory({
    required this.sessions,
    required this.revisions,
    required this.documentExists,
  });
  final List<RecitationEntry> sessions;
  final List<RevisionEntry> revisions;
  final bool documentExists;

  factory CircleHistory.fromMap(Map<String, dynamic>? data) {
    List<Map<String, dynamic>> list(Object? raw) {
      if (raw is! List) return const [];
      return raw.whereType<Map>().map(
        (item) => Map<String, dynamic>.from(item),
      ).toList(growable: false);
    }
    final sessions = list(data?['sessionRecords'])
        .map(RecitationEntry.fromMap).toList(growable: false);
    final revisions = list(data?['dailyRevisionRecords'])
        .map(RevisionEntry.fromMap).toList(growable: false);
    return CircleHistory(
      sessions: sessions,
      revisions: revisions,
      documentExists: data != null,
    );
  }
}

final circleHistoryProvider = StreamProvider<CircleHistory>((ref) {
  final user = ref.watch(authStateProvider).value;
  if (user == null) {
    return Stream.value(CircleHistory.fromMap(null));
  }
  return ref.watch(firestoreProvider)
      .doc('users/${user.uid}/circleData/main')
      .snapshots()
      .map((snapshot) => CircleHistory.fromMap(snapshot.data()));
});
