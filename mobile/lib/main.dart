import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Skeuomorphic dark green status bar & light cream navigation bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF2C7865),
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFFFEFDED),
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const MistriApp());
}

class MistriApp extends StatelessWidget {
  const MistriApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mistri – আপনার এলাকার বিশ্বস্ত মিস্ত্রী',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFFEFDED),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF2C7865),
          secondary: Color(0xFF38967F),
          surface: Color(0xFFFEFDED),
        ),
        fontFamily: 'sans-serif',
      ),
      home: const MistriWebViewScreen(),
    );
  }
}

class MistriWebViewScreen extends StatefulWidget {
  const MistriWebViewScreen({super.key});

  @override
  State<MistriWebViewScreen> createState() => _MistriWebViewScreenState();
}

class _MistriWebViewScreenState extends State<MistriWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  String _currentUrl = 'http://192.168.10.145:3000';
  final TextEditingController _urlInputController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initWebViewController();
    _loadSavedUrlAndNavigate();
  }

  void _initWebViewController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFEFDED))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              setState(() {
                _isLoading = false;
                _hasError = true;
                _errorMessage = error.description;
              });
            }
          },
        ),
      );

    if (_controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      final androidController = _controller.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);
      androidController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          return const GeolocationPermissionsResponse(
            allow: true,
            retain: true,
          );
        },
      );
    }
  }

  Future<void> _loadSavedUrlAndNavigate() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('mistri_app_url');
    if (savedUrl != null && savedUrl.isNotEmpty) {
      _currentUrl = savedUrl;
    }
    _urlInputController.text = _currentUrl;
    _controller.loadRequest(Uri.parse(_currentUrl));
  }

  Future<void> _saveAndNavigateToUrl(String newUrl) async {
    String cleanUrl = newUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'http://$cleanUrl';
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('mistri_app_url', cleanUrl);
    setState(() {
      _currentUrl = cleanUrl;
      _hasError = false;
      _isLoading = true;
    });
    _controller.loadRequest(Uri.parse(cleanUrl));
  }

  void _showUrlSettingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFFFEFDED),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.settings, color: Color(0xFF2C7865)),
            SizedBox(width: 8),
            Text(
              'সার্ভার লিংক পরিবর্তন',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF14382F),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'আপনার কম্পিউটার বা লাইভ ওয়েবসাইটের লিংক দিন:',
              style: TextStyle(fontSize: 12, color: Colors.black87),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _urlInputController,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                hintText: 'e.g. http://192.168.10.145:3000',
                hintStyle: const TextStyle(fontSize: 12, color: Colors.black38),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF38967F)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF2C7865), width: 2),
                ),
              ),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              children: [
                ActionChip(
                  label: const Text('Wi-Fi IP', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    _urlInputController.text = 'http://192.168.10.145:3000';
                  },
                ),
                ActionChip(
                  label: const Text('Emulator', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    _urlInputController.text = 'http://10.0.2.2:3000';
                  },
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('বাতিল', style: TextStyle(color: Colors.black54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2C7865),
              foregroundColor: const Color(0xFFFEFDED),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _saveAndNavigateToUrl(_urlInputController.text);
            },
            child: const Text('সংরক্ষণ ও কানেক্ট', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              // Main WebView with pull-to-refresh
              RefreshIndicator(
                color: const Color(0xFF2C7865),
                backgroundColor: const Color(0xFFFEFDED),
                onRefresh: () async {
                  await _controller.reload();
                },
                child: WebViewWidget(controller: _controller),
              ),

              // Loading Spinner Bar
              if (_isLoading)
                const Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    color: Color(0xFF2C7865),
                    backgroundColor: Color(0xFFFEFDED),
                    minHeight: 3,
                  ),
                ),

              // Connection Error Screen
              if (_hasError)
                Container(
                  color: const Color(0xFFFEFDED),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2C7865).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.wifi_off_rounded,
                            size: 56,
                            color: Color(0xFF2C7865),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF14382F),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'লিংক: $_currentUrl\nকম্পিউটারে `npm run dev` বা সার্ভার চালু আছে কিনা নিশ্চিত করুন।',
                          style: const TextStyle(fontSize: 12, color: Colors.black54),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2C7865),
                                foregroundColor: const Color(0xFFFEFDED),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: () {
                                setState(() {
                                  _hasError = false;
                                  _isLoading = true;
                                });
                                _controller.reload();
                              },
                              icon: const Icon(Icons.refresh, size: 18),
                              label: const Text('পুনরায় চেষ্টা করুন', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 12),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF2C7865),
                                side: const BorderSide(color: Color(0xFF2C7865)),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: _showUrlSettingsDialog,
                              icon: const Icon(Icons.settings, size: 18),
                              label: const Text('লিংক পরিবর্তন'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
