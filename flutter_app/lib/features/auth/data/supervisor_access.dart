import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_repository.dart';

/// Admin access is granted only by a server-issued Firebase custom claim.
/// Do not use an email allow-list stored in a client-writable document.
final supervisorAccessProvider = FutureProvider<bool>((ref) async {
  final user = ref.watch(authStateProvider).value;
  if (user == null) return false;
  final token = await user.getIdTokenResult(true);
  return token.claims?['supervisor'] == true;
});
