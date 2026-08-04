import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state.dart';
import 'screens/home_shell.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const ArkApp(),
    ),
  );
}

class ArkApp extends StatelessWidget {
  const ArkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ARK Jewelry Software',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeShell(),
    );
  }
}
