import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/booking.dart';

class LiveTrackingScreen extends StatefulWidget {
  final Booking booking;

  const LiveTrackingScreen({super.key, required this.booking});

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  late LatLng _customerLocation;
  late LatLng _mistriLocation;
  double _distanceKm = 1.4;
  int _etaMinutes = 7;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _customerLocation = LatLng(widget.booking.latitude, widget.booking.longitude);
    // Start worker 1.4km away
    _mistriLocation = LatLng(
      widget.booking.latitude + 0.008,
      widget.booking.longitude + 0.009,
    );

    // Simulate real-time approach
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!mounted) return;
      setState(() {
        if (_distanceKm > 0.1) {
          _distanceKm -= 0.15;
          if (_distanceKm < 0.1) _distanceKm = 0.08;
          _etaMinutes = (_distanceKm * 5).ceil().clamp(1, 15);

          // Interpolate marker towards customer
          final latDiff = (_customerLocation.latitude - _mistriLocation.latitude) * 0.15;
          final lngDiff = (_customerLocation.longitude - _mistriLocation.longitude) * 0.15;
          _mistriLocation = LatLng(
            _mistriLocation.latitude + latDiff,
            _mistriLocation.longitude + lngDiff,
          );
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _makePhoneCall(String phone) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('লাইভ জিপিএস ট্র্যাকিং'),
      ),
      body: Stack(
        children: [
          // FlutterMap
          FlutterMap(
            options: MapOptions(
              initialCenter: _customerLocation,
              initialZoom: 14.5,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.mistri.app',
              ),
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: [_mistriLocation, _customerLocation],
                    color: AppTheme.primaryBlue,
                    strokeWidth: 4,
                  ),
                ],
              ),
              MarkerLayer(
                markers: [
                  // Customer Destination Marker
                  Marker(
                    point: _customerLocation,
                    width: 50,
                    height: 50,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.primaryBlue,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: const Icon(Icons.home, color: Colors.white, size: 24),
                    ),
                  ),

                  // Mistri Moving Marker
                  Marker(
                    point: _mistriLocation,
                    width: 55,
                    height: 55,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.amber,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 6)],
                      ),
                      child: ClipOval(
                        child: Image.network(
                          widget.booking.mistriAvatar,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Icon(Icons.person, color: Colors.black),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Live ETA Pill (Top)
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
              ),
              child: Row(
                children: [
                  Container(
                    height: 10,
                    width: 10,
                    decoration: const BoxDecoration(
                      color: AppTheme.emerald600,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'লাইভ সিগন্যাল সক্রিয়',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.emerald600),
                  ),
                  const Spacer(),
                  Text(
                    'আনুমানিক ${AppFormatters.toBanglaNumber(_etaMinutes)} মিনিট বাকি',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Worker Info Floating Card
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Card(
              elevation: 6,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.network(
                            widget.booking.mistriAvatar,
                            height: 50,
                            width: 50,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.booking.mistriName,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                widget.booking.category,
                                style: const TextStyle(fontSize: 11, color: AppTheme.slate600),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'দূরত্ব: ${AppFormatters.formatDistance(_distanceKm)}',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue.withOpacity(0.1),
                            padding: const EdgeInsets.all(12),
                          ),
                          icon: const Icon(Icons.phone, color: AppTheme.primaryBlue),
                          onPressed: () => _makePhoneCall(widget.booking.mistriPhone),
                        ),
                      ],
                    ),
                    const Divider(height: 20, color: AppTheme.slate100),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: AppTheme.primaryBlue),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            widget.booking.jobAddress,
                            style: const TextStyle(fontSize: 11, color: AppTheme.slate600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
