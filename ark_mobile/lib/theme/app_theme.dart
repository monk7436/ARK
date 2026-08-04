import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color bgPrimary = Color(0xFFF8FAFC);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color borderSubtle = Color(0xFFE2E8F0);
  static const Color goldPrimary = Color(0xFFD97706);
  static const Color goldDark = Color(0xFFB45309);
  static const Color goldGlow = Color(0x1AD97706);
  
  static const Color textMain = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF475569);
  static const Color textDim = Color(0xFF64748B);

  static const Color inwardGreen = Color(0xFF15803D);
  static const Color outwardRose = Color(0xFFBE123C);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: goldPrimary,
      colorScheme: const ColorScheme.light(
        primary: goldPrimary,
        surface: bgCard,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(color: textMain, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.outfit(color: textMain, fontWeight: FontWeight.w700),
        titleMedium: GoogleFonts.outfit(color: textMain, fontWeight: FontWeight.w600),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: goldPrimary,
        unselectedItemColor: textDim,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: bgCard,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: borderSubtle),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: goldPrimary),
        ),
        labelStyle: const TextStyle(color: textMuted, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
