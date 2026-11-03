import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/config/supabase_config.dart';
import 'core/theme/app_theme.dart';
import 'screens/customer/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Supabase client
  await SupabaseConfig.init();

  runApp(const MistriApp());
}

class MistriApp extends StatelessWidget {
  const MistriApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'mistri – আপনার এলাকার বিশ্বস্ত মিস্ত্রী',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const CustomerHomeScreen(),
    );
  }
}
