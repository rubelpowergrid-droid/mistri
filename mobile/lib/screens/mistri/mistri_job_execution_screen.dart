import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../models/booking.dart';

class MistriJobExecutionScreen extends StatefulWidget {
  final Booking booking;

  const MistriJobExecutionScreen({super.key, required this.booking});

  @override
  State<MistriJobExecutionScreen> createState() => _MistriJobExecutionScreenState();
}

class _MistriJobExecutionScreenState extends State<MistriJobExecutionScreen> {
  bool _isGpsActive = false;
  late String _currentStatus;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.booking.status;
  }

  Future<void> _makePhoneCall(String phone) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  void _updateStatus(String nextStatus, String message) {
    setState(() {
      _currentStatus = nextStatus;
      if (nextStatus == 'completed') {
        _isGpsActive = false;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppTheme.primaryBlue),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: const Text('কাজের বিবরণ ও ট্র্যাকিং'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.booking.bookingNumber,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _currentStatus == 'completed' ? 'সম্পন্ন' : _currentStatus == 'in_progress' ? 'কাজ চলছে' : 'গৃহীত',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20, color: AppTheme.slate100),
                    Text(
                      widget.booking.workDescription,
                      style: const TextStyle(fontSize: 13, color: AppTheme.slate900, height: 1.4),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: AppTheme.primaryBlue),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            widget.booking.jobAddress,
                            style: const TextStyle(fontSize: 12, color: AppTheme.slate600),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.phone, color: AppTheme.primaryBlue, size: 20),
                          onPressed: () => _makePhoneCall(widget.booking.mistriPhone),
                          tooltip: 'কাস্টমারকে কল করুন',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Live GPS Broadcast Switch Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.satellite_alt,
                              color: _isGpsActive ? AppTheme.emerald600 : AppTheme.slate400,
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('লাইভ জিপিএস লোকেশন শেয়ার', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                Text(
                                  _isGpsActive ? 'কাস্টমার আপনার অবস্থান দেখছেন' : 'লোকেশন ব্রডকাস্ট বন্ধ',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: _isGpsActive ? AppTheme.emerald600 : AppTheme.slate400,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Switch(
                          value: _isGpsActive,
                          activeThumbColor: AppTheme.emerald600,
                          onChanged: (val) {
                            setState(() => _isGpsActive = val);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Step-by-Step Execution Actions
            const Text('কাজের অগ্রগতি আপডেট করুন', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            // 1. En Route
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _isGpsActive ? AppTheme.primaryBlue : AppTheme.slate100,
                  child: Icon(Icons.directions_bike, color: _isGpsActive ? Colors.white : AppTheme.slate400, size: 20),
                ),
                title: const Text('রওয়ানা হয়েছি (Start Journey)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: const Text('কাস্টমার লাইভ ট্র্যাক দেখতে পাবেন', style: TextStyle(fontSize: 11)),
                trailing: ElevatedButton(
                  onPressed: () {
                    setState(() => _isGpsActive = true);
                    _updateStatus('accepted', 'যাত্রা শুরু হয়েছে');
                  },
                  child: const Text('রওয়ানা'),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // 2. Arrived
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.slate100,
                  child: const Icon(Icons.place, color: AppTheme.slate600, size: 20),
                ),
                title: const Text('কাস্টমারের ঠিকানায় পৌঁছেছি (Arrived)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                trailing: OutlinedButton(
                  onPressed: () {
                    _updateStatus('in_progress', 'পৌঁছানো নিশ্চিত করা হয়েছে');
                  },
                  child: const Text('পৌঁছেছি'),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // 3. Complete
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _currentStatus == 'completed' ? AppTheme.emerald600 : AppTheme.slate100,
                  child: Icon(Icons.check, color: _currentStatus == 'completed' ? Colors.white : AppTheme.slate400, size: 20),
                ),
                title: const Text('কাজ সম্পন্ন হয়েছে (Complete Job)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                trailing: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.emerald600),
                  onPressed: () {
                    _updateStatus('completed', 'অভিনন্দন! কাজটি সম্পন্ন হয়েছে।');
                  },
                  child: const Text('সম্পন্ন'),
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
