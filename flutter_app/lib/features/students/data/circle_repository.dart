import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../domain/student.dart';

final firestoreProvider =
    Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);

final circleRepositoryProvider = Provider<CircleRepository>((ref) {
  return CircleRepository(ref.watch(firestoreProvider));
});

final circleStudentsProvider = StreamProvider<List<Student>>((ref) {
  final user = ref.watch(authStateProvider).value;
  if (user == null) return Stream.value(const <Student>[]);
  return ref.watch(circleRepositoryProvider).watchLegacyStudents(user.uid);
});

class CircleRepository {
  CircleRepository(this._firestore);

  final FirebaseFirestore _firestore;

  DocumentReference<Map<String, dynamic>> _legacyCircleRef(String uid) {
    return _firestore.doc('users/$uid/circleData/main');
  }

  Stream<List<Student>> watchLegacyStudents(String uid) {
    return _legacyCircleRef(uid).snapshots().map((snapshot) {
      final raw = snapshot.data()?['students'];
      if (raw is! List) return const <Student>[];

      return raw
          .whereType<Map>()
          .map((item) => Student.fromMap(Map<String, dynamic>.from(item)))
          .where((student) => student.id.isNotEmpty)
          .toList(growable: false);
    });
  }

  Future<void> addLegacyStudent({
    required String uid,
    required String name,
    String phone = '',
    String parentPhone = '',
    int currentRub = 1,
  }) async {
    final ref = _legacyCircleRef(uid);

    await _firestore.runTransaction((transaction) async {
      final snapshot = await transaction.get(ref);
      final data = snapshot.data() ?? const <String, dynamic>{};
      final raw = data['students'];

      final students = raw is List
          ? raw
              .whereType<Map>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList()
          : <Map<String, dynamic>>[];

      final existingCodes = students
          .map((item) => (item['accessCode'] ?? '').toString().toUpperCase())
          .toSet();

      String accessCode;
      final random = Random.secure();
      do {
        accessCode = 'STU-${1000 + random.nextInt(9000)}';
      } while (existingCodes.contains(accessCode));

      final now = DateTime.now();
      final id = 'stu_${now.microsecondsSinceEpoch}';
      final date =
          '${now.year.toString().padLeft(4, '0')}-'
          '${now.month.toString().padLeft(2, '0')}-'
          '${now.day.toString().padLeft(2, '0')}';

      final safeRub = currentRub.clamp(1, 240).toInt();
      final student = Student(
        id: id,
        name: name.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        accessCode: accessCode,
        joinDate: date,
        currentRub: safeRub,
        completedRubCount: (safeRub - 1).clamp(0, 240).toInt(),
        status: 'active',
        notes: '',
      );

      students.insert(0, student.toMap());

      transaction.set(
        ref,
        {
          'students': students,
          'updatedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    });
  }
}
