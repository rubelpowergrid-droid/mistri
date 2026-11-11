import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = 'https://oeaibuixwxmpzkkdaekz.supabase.co';
  static const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYWlidWl4d3htcHpra2RhZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2ODcxNzEsImV4cCI6MjEwOTI2MzE3MX0.rpAJddhIuKfoJIKQnJ-Z8DTiQVQR4Vv8LBC7qfmXNig';

  static Future<void> init() async {
    try {
      await Supabase.initialize(
        url: url,
        anonKey: anonKey,
      );
    } catch (_) {
      // Offline preview mode
    }
  }

  static SupabaseClient? get client {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }
}
