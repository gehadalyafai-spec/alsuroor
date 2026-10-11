import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final firebaseAuthProvider =
    Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(firebaseAuthProvider));
});

final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(authRepositoryProvider).authStateChanges();
});

class AuthRepository {
  AuthRepository(this._auth);

  final FirebaseAuth _auth;

  Stream<User?> authStateChanges() => _auth.authStateChanges();

  Future<UserCredential> signIn({
    required String email,
    required String password,
  }) {
    return _auth.signInWithEmailAndPassword(
      email: email.trim().toLowerCase(),
      password: password,
    );
  }

  Future<UserCredential> register({
    required String email,
    required String password,
  }) {
    return _auth.createUserWithEmailAndPassword(
      email: email.trim().toLowerCase(),
      password: password,
    );
  }

  Future<UserCredential> signInWithGoogle() async {
    if (!kIsWeb) {
      throw UnsupportedError('تسجيل Google متاح حاليًا في نسخة الويب فقط');
    }
    final provider = GoogleAuthProvider();
    provider.setCustomParameters({'prompt': 'select_account'});
    return _auth.signInWithPopup(provider);
  }

  Future<void> signOut() => _auth.signOut();
}
