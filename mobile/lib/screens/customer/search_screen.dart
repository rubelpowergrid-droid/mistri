import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/mistri.dart';
import 'mistri_profile_screen.dart';

class SearchScreen extends StatefulWidget {
  final String? initialCategory;

  const SearchScreen({super.key, this.initialCategory});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isMapView = false;
  double _radiusKm = 15.0;
  double _minRating = 0.0;
  bool _verifiedOnly = false;
  bool _availableOnly = false;
  String _selectedCategory = 'সব';

  final List<String> _categories = [
    'সব',
    'ইলেকট্রিশিয়ান',
    'প্লাম্বার',
    'ফ্রিজ ও এসি',
    'কাঠমিস্ত্রী',
    'রাজমিস্ত্রী',
    'রং মিস্ত্রী',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      _selectedCategory = widget.initialCategory!;
    }
  }

  List<Mistri> get _filteredMistris {
    return Mistri.sampleMistris.where((m) {
      if (_selectedCategory != 'সব' && m.category != _selectedCategory) {
        return false;
      }
      if (_searchCtrl.text.isNotEmpty) {
        final q = _searchCtrl.text.toLowerCase();
        final match = m.name.toLowerCase().contains(q) ||
            m.title.toLowerCase().contains(q) ||
            m.category.toLowerCase().contains(q);
        if (!match) return false;
      }
      if (m.distanceKm > _radiusKm) return false;
      if (m.ratingAvg < _minRating) return false;
      if (_verifiedOnly && !m.isVerified) return false;
      if (_availableOnly && !m.isAvailableToday) return false;
      return true;
    }).toList();
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'ফিল্টার ও বাছাই (Filters)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.slate900,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(color: AppTheme.slate100),
                  const SizedBox(height: 10),

                  // Radius slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'সর্বোচ্চ দূরত্ব (Radius):',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${AppFormatters.toBanglaNumber(_radiusKm.toInt())} কিমি',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                  Slider(
                    value: _radiusKm,
                    min: 1,
                    max: 30,
                    divisions: 29,
                    activeColor: AppTheme.primaryBlue,
                    onChanged: (val) {
                      setModalState(() => _radiusKm = val);
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 12),

                  // Rating filter
                  const Text(
                    'রেটিং ফিল্টার:',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [0.0, 4.0, 4.5, 4.8].map((rate) {
                      final isSelected = _minRating == rate;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(rate == 0.0 ? 'সকল' : '★ ${rate}+'),
                          selected: isSelected,
                          selectedColor: AppTheme.primaryBlue.withOpacity(0.15),
                          onSelected: (_) {
                            setModalState(() => _minRating = rate);
                            setState(() {});
                          },
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Switches
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('কেবলমাত্র অ্যাডমিন ভেরিফাইড মিস্ত্রী', style: TextStyle(fontSize: 13)),
                    value: _verifiedOnly,
                    activeColor: AppTheme.primaryBlue,
                    onChanged: (val) {
                      setModalState(() => _verifiedOnly = val);
                      setState(() {});
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('আজকে সেবা দিতে প্রস্তুত', style: TextStyle(fontSize: 13)),
                    value: _availableOnly,
                    activeColor: AppTheme.primaryBlue,
                    onChanged: (val) {
                      setModalState(() => _availableOnly = val);
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('ফিল্টার প্রয়োগ করুন'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final mistris = _filteredMistris;

    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: const Text('মিস্ত্রী অনুসন্ধান'),
        actions: [
          // List / Map View Toggle
          IconButton(
            icon: Icon(_isMapView ? Icons.view_list : Icons.map_outlined),
            onPressed: () => setState(() => _isMapView = !_isMapView),
            tooltip: _isMapView ? 'তালিকা দেখুন' : 'ম্যাপে দেখুন',
          ),
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: _showFilterModal,
            tooltip: 'ফিল্টার',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Box
          Container(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            color: Colors.white,
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'কাজের নাম বা মিস্ত্রীর নাম লিখুন...',
                prefixIcon: const Icon(Icons.search, size: 20, color: AppTheme.slate400),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),

          // Categories Horizontal Chips
          Container(
            height: 48,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: AppTheme.primaryBlue,
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppTheme.slate600,
                    ),
                    backgroundColor: AppTheme.slate100,
                    showCheckmark: false,
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppTheme.slate200),

          // Search Results or Interactive Map
          Expanded(
            child: _isMapView
                ? FlutterMap(
                    options: const MapOptions(
                      initialCenter: LatLng(26.0333, 88.4667), // Thakurgaon
                      initialZoom: 13.5,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.mistri.app',
                      ),
                      CircleLayer(
                        circles: [
                          CircleMarker(
                            point: const LatLng(26.0333, 88.4667),
                            color: AppTheme.primaryBlue.withOpacity(0.12),
                            borderColor: AppTheme.primaryBlue,
                            borderStrokeWidth: 2,
                            radius: 1200,
                          ),
                        ],
                      ),
                      MarkerLayer(
                        markers: mistris.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final m = entry.value;
                          final offsetLat = 26.0333 + (idx * 0.005) - 0.003;
                          final offsetLng = 88.4667 + (idx * 0.006) - 0.004;

                          return Marker(
                            point: LatLng(offsetLat, offsetLng),
                            width: 60,
                            height: 60,
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => MistriProfileScreen(mistri: m),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AppTheme.primaryBlue, width: 2),
                                  boxShadow: const [
                                    BoxShadow(color: Colors.black26, blurRadius: 4),
                                  ],
                                ),
                                child: ClipOval(
                                  child: Image.network(
                                    m.avatarUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.person),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: mistris.length,
                    itemBuilder: (context, index) {
                      final m = mistris[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => MistriProfileScreen(mistri: m),
                              ),
                            );
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: Image.network(
                                    m.avatarUrl,
                                    height: 70,
                                    width: 70,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              m.name,
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                                color: AppTheme.slate900,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (m.isVerified) ...[
                                            const SizedBox(width: 4),
                                            const Icon(Icons.verified, size: 14, color: AppTheme.primaryBlue),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        m.title,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppTheme.slate600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 14, color: AppTheme.amber500),
                                          const SizedBox(width: 2),
                                          Text(
                                            '${m.ratingAvg}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Text(
                                            ' (${AppFormatters.toBanglaNumber(m.totalReviews)})',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppTheme.slate400,
                                            ),
                                          ),
                                          const Spacer(),
                                          Text(
                                            AppFormatters.formatDistance(m.distanceKm),
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.primaryBlue,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
