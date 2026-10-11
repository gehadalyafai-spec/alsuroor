import 'package:alsuroor_flutter/features/sessions/domain/recitation_plan.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('first quarter contains only quarter 1', () {
    final plan = buildRecitationPlan(1);
    expect(plan.allRubs, [1]);
    expect(plan.totalCount, 1);
  });

  test('quarter 4 contains quarter 1 through 4', () {
    expect(buildRecitationPlan(4).allRubs, [1, 2, 3, 4]);
  });

  test('quarter 100 contains linking quarters', () {
    final plan = buildRecitationPlan(100);
    expect(plan.linkingRubs, [97, 98, 99]);
    expect(plan.allRubs, [97, 98, 99, 100]);
  });

  test('quarters are clamped to Quran range', () {
    expect(buildRecitationPlan(999).newRub, 240);
    expect(buildRecitationPlan(-3).newRub, 1);
  });
}
