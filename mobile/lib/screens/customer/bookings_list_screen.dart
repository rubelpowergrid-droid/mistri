import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/booking.dart';
import 'live_tracking_screen.dart';

class BookingsListScreen extends StatefulWidget {
  final bool showSuccessBanner;

  const BookingsListScreen({super.key, this.showSuccessBanner = false});

  @override
  State<BookingsListScreen> createState() => _BookingsListScreenState();
}

class _BookingsListScreenState extends State<BookingsListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  bool _bannerVisible = false;

  @override
  void initState() {
    super.initState();
    _bannerVisible = widget.showSuccessBanner;
    _tabCtrl = TabController(length: 5, vsync: this);
  }

  Future<void> _makePhoneCall(String phone) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  void _showReviewDialog(Booking booking) {
    int quality = 5;
    int behaviour = 5;
    int punctuality = 5;
    int pricing = 5;
    final commentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: [
                  const Icon(Icons.star, color: AppTheme.amber500),
                  const SizedBox(width: 8),
                  const Text('রেটিং ও রিভিউ দিন', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('মিস্ত্রী: ${booking.mistriName}', style: const TextStyle(fontSize: 12, color: AppTheme.slate600)),
                    const SizedBox(height: 12),
                    _buildRatingRow('কাজের মান (Quality)', quality, (v) => setDialogState(() => quality = v)),
                    _buildRatingRow('ব্যবহার ও আচরণ (Behaviour)', behaviour, (v) => setDialogState(() => behaviour = v)),
                    _buildRatingRow('সময়ানুবর্তিতা (Punctuality)', punctuality, (v) => setDialogState(() => punctuality = v)),
                    _buildRatingRow('মজুরি সন্তুষ্টি (Pricing)', pricing, (v) => setDialogState(() => pricing = v)),
                    const SizedBox(height: 10),
                    TextField(
                      controller: commentCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        hintText: 'আপনার অভিজ্ঞতা সংক্ষেপে লিখুন...',
                        contentPadding: EdgeInsets.all(10),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('বাতিল'),
                ),
                ElevatedButton(
                  onPressed: () {
                    final idx = Booking.sampleBookings.indexWhere((b) => b.id == booking.id);
                    if (idx != -1) {
                      Booking.sampleBookings[idx] = Booking.sampleBookings[idx].copyWith(hasReviewed: true);
                    }
                    Navigator.pop(context);
                    setState(() {});
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('রিভিউ সফলভাবে জমা দেওয়া হয়েছে!')),
                    );
                  },
                  child: const Text('জমা দিন'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildRatingRow(String label, int current, Function(int) onSelected) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
          Row(
            children: List.generate(5, (index) {
              final star = index + 1;
              return GestureDetector(
                onTap: () => onSelected(star),
                child: Icon(
                  star <= current ? Icons.star : Icons.star_border,
                  size: 20,
                  color: AppTheme.amber500,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  List<Booking> _filterByStatus(String tabKey) {
    if (tabKey == 'all') return Booking.sampleBookings;
    if (tabKey == 'active') {
      return Booking.sampleBookings.where((b) => b.status == 'accepted' || b.status == 'in_progress').toList();
    }
    return Booking.sampleBookings.where((b) => b.status == tabKey).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: const Text('আমার বুকিং ইতিহাস'),
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          labelColor: AppTheme.primaryBlue,
          unselectedLabelColor: AppTheme.slate400,
          indicatorColor: AppTheme.primaryBlue,
          tabs: const [
            Tab(text: 'সকল'),
            Tab(text: 'চলমান ও নির্ধারিত'),
            Tab(text: 'অপেক্ষমান'),
            Tab(text: 'সম্পন্ন'),
            Tab(text: 'বাতিল'),
          ],
        ),
      ),
      body: Column(
        children: [
          if (_bannerVisible)
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.emerald600.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.emerald600.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppTheme.emerald600, size: 20),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'বুকিং অনুরোধ সফলভাবে পাঠানো হয়েছে!',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.emerald600),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16),
                    onPressed: () => setState(() => _bannerVisible = false),
                  ),
                ],
              ),
            ),
          Expanded(
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                _buildBookingList(_filterByStatus('all')),
                _buildBookingList(_filterByStatus('active')),
                _buildBookingList(_filterByStatus('pending')),
                _buildBookingList(_filterByStatus('completed')),
                _buildBookingList(_filterByStatus('cancelled')),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingList(List<Booking> list) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_outlined, size: 48, color: AppTheme.slate200),
            const SizedBox(height: 12),
            const Text('এই বিভাগে কোনো বুকিং নেই', style: TextStyle(color: AppTheme.slate600)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final b = list[index];
        final isActive = b.status == 'accepted' || b.status == 'in_progress';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Number and Status
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      b.bookingNumber,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                    _buildStatusBadge(b.status),
                  ],
                ),
                const Divider(height: 16, color: AppTheme.slate100),

                // Mistri info & job description
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(b.mistriAvatar, height: 50, width: 50, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(b.mistriName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          Text(b.category, style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue)),
                          const SizedBox(height: 4),
                          Text(
                            '"${b.workDescription}"',
                            style: const TextStyle(fontSize: 11, color: AppTheme.slate600),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Time & Address
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.slate100),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.schedule, size: 14, color: AppTheme.slate400),
                      const SizedBox(width: 4),
                      Text('${b.preferredDate}, ${b.preferredTime}', style: const TextStyle(fontSize: 11)),
                      const Spacer(),
                      Text(
                        AppFormatters.formatBDT(b.agreedPrice ?? b.estimatedBudget),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.slate900),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (isActive) ...[
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                        icon: const Icon(Icons.phone, size: 14),
                        label: const Text('কল', style: TextStyle(fontSize: 11)),
                        onPressed: () => _makePhoneCall(b.mistriPhone),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          backgroundColor: AppTheme.primaryBlue,
                        ),
                        icon: const Icon(Icons.navigation, size: 14, color: Colors.amber),
                        label: const Text('লাইভ ট্র্যাকিং', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => LiveTrackingScreen(booking: b),
                            ),
                          );
                        },
                      ),
                    ],
                    if (b.status == 'completed') ...[
                      if (!b.hasReviewed)
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.amber500,
                            foregroundColor: AppTheme.slate900,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          icon: const Icon(Icons.star, size: 14, color: AppTheme.slate900),
                          label: const Text('রেটিং দিন', style: TextStyle(fontSize: 11)),
                          onPressed: () => _showReviewDialog(b),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.emerald600.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('রিভিউ সম্পন্ন', style: TextStyle(fontSize: 11, color: AppTheme.emerald600, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = AppTheme.slate100;
    Color fg = AppTheme.slate600;
    String text = status;

    switch (status) {
      case 'accepted':
        bg = AppTheme.primaryBlue.withOpacity(0.1);
        fg = AppTheme.primaryBlue;
        text = 'গৃহীত';
        break;
      case 'in_progress':
        bg = AppTheme.amber500.withOpacity(0.15);
        fg = AppTheme.amber500;
        text = 'চলমান';
        break;
      case 'completed':
        bg = AppTheme.emerald600.withOpacity(0.1);
        fg = AppTheme.emerald600;
        text = 'সম্পন্ন';
        break;
      case 'pending':
        bg = AppTheme.slate100;
        fg = AppTheme.slate600;
        text = 'অপেক্ষমান';
        break;
      case 'cancelled':
        bg = AppTheme.rose600.withOpacity(0.1);
        fg = AppTheme.rose600;
        text = 'বাতিল';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: fg)),
    );
  }
}
