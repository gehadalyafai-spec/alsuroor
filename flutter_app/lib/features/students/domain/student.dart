class Student {
  const Student({
    required this.id,
    required this.name,
    required this.phone,
    required this.parentPhone,
    required this.accessCode,
    required this.joinDate,
    required this.currentRub,
    required this.completedRubCount,
    required this.status,
    required this.notes,
    this.email,
  });

  final String id;
  final String name;
  final String phone;
  final String parentPhone;
  final String? email;
  final String accessCode;
  final String joinDate;
  final int currentRub;
  final int completedRubCount;
  final String status;
  final String notes;

  factory Student.fromMap(Map<String, dynamic> map) {
    return Student(
      id: (map['id'] ?? '').toString(),
      name: (map['name'] ?? 'طالب').toString(),
      phone: (map['phone'] ?? '').toString(),
      parentPhone: (map['parentPhone'] ?? '').toString(),
      email: map['email']?.toString(),
      accessCode: (map['accessCode'] ?? '').toString(),
      joinDate: (map['joinDate'] ?? '').toString(),
      currentRub: _asInt(map['currentRub'], fallback: 1).clamp(1, 240),
      completedRubCount: _asInt(map['completedRubCount']).clamp(0, 240),
      status: (map['status'] ?? 'active').toString(),
      notes: (map['notes'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'phone': phone,
        'parentPhone': parentPhone,
        if (email != null && email!.trim().isNotEmpty) 'email': email!.trim(),
        'accessCode': accessCode,
        'joinDate': joinDate,
        'currentRub': currentRub,
        'completedRubCount': completedRubCount,
        'status': status,
        'notes': notes,
      };

  static int _asInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }
}
