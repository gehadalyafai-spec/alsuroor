class RecitationPlan {
  const RecitationPlan({
    required this.newRub,
    required this.linkingRubs,
    required this.allRubs,
  });

  final int newRub;
  final List<int> linkingRubs;
  final List<int> allRubs;

  int get totalCount => allRubs.length;
}

RecitationPlan buildRecitationPlan(int targetNewRub) {
  final safeNewRub = targetNewRub.clamp(1, 240).toInt();
  final startRub = (safeNewRub - 3).clamp(1, 240).toInt();

  final allRubs = <int>[
    for (var rub = startRub; rub <= safeNewRub; rub++) rub,
  ];

  return RecitationPlan(
    newRub: safeNewRub,
    linkingRubs: allRubs
        .where((rub) => rub < safeNewRub)
        .toList(growable: false),
    allRubs: List.unmodifiable(allRubs),
  );
}
