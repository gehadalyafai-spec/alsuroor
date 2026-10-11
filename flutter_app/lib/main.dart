import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Object? firebaseError;
  try {
    await Firebase.initializeApp();
  } catch (error) {
    firebaseError = error;
  }

  runApp(
    ProviderScope(
      child: AlSuroorBootstrap(firebaseError: firebaseError),
    ),
  );
}

class AlSuroorBootstrap extends StatelessWidget {
  const AlSuroorBootstrap({super.key, required this.firebaseError});

  final Object? firebaseError;

  @override
  Widget build(BuildContext context) {
    if (firebaseError == null) {
      return const AlSuroorApp();
    }

    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Directionality(
        textDirection: TextDirection.rtl,
        child: Scaffold(
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'يلزم تنفيذ flutterfire configure --project=alsuroor-app ثم إعادة التشغيل.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
