import 'package:flutter/material.dart';

class ServiceCategory {
  final String id;
  final String nameBn;
  final String nameEn;
  final IconData icon;
  final Color color;

  const ServiceCategory({
    required this.id,
    required this.nameBn,
    required this.nameEn,
    required this.icon,
    required this.color,
  });

  static const List<ServiceCategory> standardCategories = [
    ServiceCategory(
      id: 'cat-electrical',
      nameBn: 'ইলেকট্রিশিয়ান',
      nameEn: 'Electrician',
      icon: Icons.bolt,
      color: Color(0xFF2563EB),
    ),
    ServiceCategory(
      id: 'cat-plumbing',
      nameBn: 'প্লাম্বার',
      nameEn: 'Plumber',
      icon: Icons.water_drop,
      color: Color(0xFF0284C7),
    ),
    ServiceCategory(
      id: 'cat-appliance',
      nameBn: 'ফ্রিজ ও এসি',
      nameEn: 'AC & Fridge',
      icon: Icons.ac_unit,
      color: Color(0xFF0D9488),
    ),
    ServiceCategory(
      id: 'cat-carpenter',
      nameBn: 'কাঠমিস্ত্রী',
      nameEn: 'Carpenter',
      icon: Icons.carpenter,
      color: Color(0xFFD97706),
    ),
    ServiceCategory(
      id: 'cat-mason',
      nameBn: 'রাজমিস্ত্রী',
      nameEn: 'Mason',
      icon: Icons.foundation,
      color: Color(0xFFB45309),
    ),
    ServiceCategory(
      id: 'cat-painter',
      nameBn: 'রং মিস্ত্রী',
      nameEn: 'Painter',
      icon: Icons.format_paint,
      color: Color(0xFF9333EA),
    ),
    ServiceCategory(
      id: 'cat-welder',
      nameBn: 'ওয়েল্ডিং ও গ্রিল',
      nameEn: 'Welder',
      icon: Icons.hardware,
      color: Color(0xFF475569),
    ),
    ServiceCategory(
      id: 'cat-tiles',
      nameBn: 'টাইলস মিস্ত্রী',
      nameEn: 'Tiles Expert',
      icon: Icons.grid_view,
      color: Color(0xFF059669),
    ),
    ServiceCategory(
      id: 'cat-mechanic',
      nameBn: 'মোটর মেকানিক',
      nameEn: 'Motor Mechanic',
      icon: Icons.build,
      color: Color(0xFFDC2626),
    ),
    ServiceCategory(
      id: 'cat-cctv',
      nameBn: 'সিসিটিভি ও সিকিউরিটি',
      nameEn: 'CCTV & Security',
      icon: Icons.videocam,
      color: Color(0xFF4F46E5),
    ),
    ServiceCategory(
      id: 'cat-solar',
      nameBn: 'সোলার ও আইপিএস',
      nameEn: 'Solar & IPS',
      icon: Icons.solar_power,
      color: Color(0xFFCA8A04),
    ),
    ServiceCategory(
      id: 'cat-glass',
      nameBn: 'গ্লাস ও থাই অ্যালুমিনিয়াম',
      nameEn: 'Glass & Thai',
      icon: Icons.window,
      color: Color(0xFF0891B2),
    ),
  ];
}

