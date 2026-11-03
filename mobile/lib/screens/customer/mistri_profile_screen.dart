import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/mistri.dart';
import 'booking_request_screen.dart';

class MistriProfileScreen extends StatelessWidget {
  final Mistri mistri;

  const MistriProfileScreen({super.key, required this.mistri});

  Future<void> _makePhoneCall(String phone) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phone,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: Text(mistri.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('প্রিয় তালিকায় যুক্ত করা হয়েছে')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: Image.network(
                            mistri.avatarUrl,
                            height: 80,
                            width: 80,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      mistri.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.slate900,
                                      ),
                                    ),
                                  ),
                                  if (mistri.isVerified) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.verified, size: 16, color: AppTheme.primaryBlue),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                mistri.title,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.slate600,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryBlue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  mistri.category,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryBlue,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: AppTheme.slate100),

                    // Quick Stats Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStat('রেটিং', '★ ${mistri.ratingAvg}'),
                        _buildStat('অভিজ্ঞতা', '${AppFormatters.toBanglaNumber(mistri.experienceYears)} বছর'),
                        _buildStat('কাজ সম্পন্ন', AppFormatters.toBanglaNumber(mistri.completedJobs)),
                        _buildStat('ভিজিট ফি', AppFormatters.formatBDT(mistri.hourlyRate)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Bio & Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'মিস্ত্রীর পরিচিতি ও দক্ষতা',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      mistri.bio,
                      style: const TextStyle(fontSize: 13, color: AppTheme.slate600, height: 1.5),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: AppTheme.primaryBlue),
                        const SizedBox(width: 6),
                        Text(
                          'কভারেজ এরিয়া: ${mistri.upazilaName}, ${mistri.districtName} (${AppFormatters.toBanglaNumber(mistri.serviceRadiusKm.toInt())} কিমি ব্যাসার্ধ)',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 4 Criteria Breakdown Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'গ্রাহক মূল্যায়ন উপাত্ত (Rating Breakdown)',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildCriteriaProgress('কাজের মান (Work Quality)', mistri.workQualityRating),
                    _buildCriteriaProgress('ব্যবহার ও আচরণ (Behaviour)', mistri.behaviourRating),
                    _buildCriteriaProgress('সময়ানুবর্তিতা (Punctuality)', mistri.punctualityRating),
                    _buildCriteriaProgress('মজুরি সন্তুষ্টি (Pricing)', mistri.pricingRating),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Portfolio Photos
            if (mistri.portfolioImages.isNotEmpty) ...[
              const Text(
                'কাজের স্থিরচিত্র (Work Portfolio)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 110,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: mistri.portfolioImages.length,
                  itemBuilder: (context, index) {
                    final img = mistri.portfolioImages[index];
                    return Container(
                      width: 140,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.slate200),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.network(img, fit: BoxFit.cover),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),

      // Bottom Action Bar: Call & Book Now
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppTheme.slate200)),
        ),
        child: Row(
          children: [
            OutlinedButton(
              onPressed: () => _makePhoneCall(mistri.phone),
              child: const Row(
                children: [
                  Icon(Icons.phone, size: 16, color: AppTheme.primaryBlue),
                  SizedBox(width: 6),
                  Text('কল করুন'),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookingRequestScreen(mistri: mistri),
                    ),
                  );
                },
                child: const Text('বুকিং অনুরোধ পাঠান'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: AppTheme.slate900,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: AppTheme.slate400,
          ),
        ),
      ],
    );
  }

  Widget _buildCriteriaProgress(String label, double rating) {
    final progress = rating / 5.0;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.slate600)),
              Text('★ $rating', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppTheme.slate100,
              color: AppTheme.primaryBlue,
            ),
          ),
        ],
      ),
    );
  }
}
