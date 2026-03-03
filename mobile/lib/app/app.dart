import 'package:flutter/material.dart';
import 'package:mobile/app/router.dart';

class TeeTimeApp extends StatelessWidget {
  const TeeTimeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Tee Time Connect',
      routerConfig: appRouter,
      theme: ThemeData(useMaterial3: true),
    );
  }
}