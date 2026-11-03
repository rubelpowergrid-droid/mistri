class Mistri {
  final String id;
  final String name;
  final String title;
  final String category;
  final String phone;
  final String avatarUrl;
  final String bio;
  final double ratingAvg;
  final int totalReviews;
  final int experienceYears;
  final int completedJobs;
  final num hourlyRate;
  final double serviceRadiusKm;
  final double distanceKm;
  final bool isVerified;
  final bool isAvailableToday;
  final List<String> portfolioImages;
  final String districtName;
  final String upazilaName;
  final double workQualityRating;
  final double behaviourRating;
  final double punctualityRating;
  final double pricingRating;

  const Mistri({
    required this.id,
    required this.name,
    required this.title,
    required this.category,
    required this.phone,
    required this.avatarUrl,
    required this.bio,
    required this.ratingAvg,
    required this.totalReviews,
    required this.experienceYears,
    required this.completedJobs,
    required this.hourlyRate,
    required this.serviceRadiusKm,
    required this.distanceKm,
    required this.isVerified,
    required this.isAvailableToday,
    required this.portfolioImages,
    required this.districtName,
    required this.upazilaName,
    this.workQualityRating = 4.8,
    this.behaviourRating = 4.9,
    this.punctualityRating = 4.7,
    this.pricingRating = 4.6,
  });

  factory Mistri.fromJson(Map<String, dynamic> json) {
    return Mistri(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      phone: json['phone'] ?? '',
      avatarUrl: json['avatar_url'] ?? '',
      bio: json['bio'] ?? '',
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 4.5,
      totalReviews: (json['total_reviews'] as num?)?.toInt() ?? 0,
      experienceYears: (json['experience_years'] as num?)?.toInt() ?? 1,
      completedJobs: (json['completed_jobs'] as num?)?.toInt() ?? 0,
      hourlyRate: (json['hourly_rate'] as num?) ?? 300,
      serviceRadiusKm: (json['service_radius_km'] as num?)?.toDouble() ?? 15.0,
      distanceKm: (json['distance_km'] as num?)?.toDouble() ?? 1.2,
      isVerified: json['is_verified'] ?? true,
      isAvailableToday: json['is_available_today'] ?? true,
      portfolioImages: List<String>.from(json['portfolio_images'] ?? []),
      districtName: json['district_name'] ?? 'ঠাকুরগাঁও',
      upazilaName: json['upazila_name'] ?? 'ঠাকুরগাঁও সদর',
      workQualityRating: (json['rating_work_quality'] as num?)?.toDouble() ?? 4.8,
      behaviourRating: (json['rating_behaviour'] as num?)?.toDouble() ?? 4.9,
      punctualityRating: (json['rating_punctuality'] as num?)?.toDouble() ?? 4.7,
      pricingRating: (json['rating_pricing'] as num?)?.toDouble() ?? 4.6,
    );
  }

  // Sample seed list for mobile offline preview
  static final List<Mistri> sampleMistris = [
    const Mistri(
      id: 'm-1',
      name: 'মোঃ রফিকুল ইসলাম',
      title: 'সিনিয়র ইলেকট্রিশিয়ান ও ওয়্যারিং স্পেশালিস্ট',
      category: 'ইলেকট্রিশিয়ান',
      phone: '01712345678',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
      bio: 'দীর্ঘ ৮ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় বাসা-বাড়ি এবং বাণিজ্যিক ভবনের সকল প্রকার ওয়্যারিং, ফ্যান, মোটর ও সুইচবোর্ড মেরামত করে আসছি।',
      ratingAvg: 4.9,
      totalReviews: 84,
      experienceYears: 8,
      completedJobs: 142,
      hourlyRate: 350,
      serviceRadiusKm: 15.0,
      distanceKm: 1.2,
      isVerified: true,
      isAvailableToday: true,
      portfolioImages: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
      ],
      districtName: 'ঠাকুরগাঁও',
      upazilaName: 'ঠাকুরগাঁও সদর',
    ),
    const Mistri(
      id: 'm-2',
      name: 'আব্দুল করিম',
      title: 'দক্ষ প্লাম্বিং ও স্যানিটারি টেকনিশিয়ান',
      category: 'প্লাম্বার',
      phone: '01898765432',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'পাইপ লিকেজ, মোটর পাম্প ইনস্টলেশন, গিজার ফিটিংস এবং বাথরুমের যাবতীয় সেনিটারি কাজ নিখুঁতভাবে করে থাকি।',
      ratingAvg: 4.8,
      totalReviews: 62,
      experienceYears: 6,
      completedJobs: 98,
      hourlyRate: 400,
      serviceRadiusKm: 12.0,
      distanceKm: 2.4,
      isVerified: true,
      isAvailableToday: true,
      portfolioImages: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',
      ],
      districtName: 'ঠাকুরগাঁও',
      upazilaName: 'ঠাকুরগাঁও সদর',
    ),
    const Mistri(
      id: 'm-3',
      name: 'তরিকুল হাসান',
      title: 'মাস্টার কাঠমিস্ত্রী ও ফার্নিচার কারিগর',
      category: 'কাঠমিস্ত্রী',
      phone: '01911223344',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      bio: 'আধুনিক কাঠের ফার্নিচার তৈরি, ড্রয়ার ও দরজার লক রিপেয়ার এবং কিচেন কেবিনেট বানাতে অভিজ্ঞ।',
      ratingAvg: 4.7,
      totalReviews: 39,
      experienceYears: 10,
      completedJobs: 75,
      hourlyRate: 450,
      serviceRadiusKm: 20.0,
      distanceKm: 3.1,
      isVerified: true,
      isAvailableToday: false,
      portfolioImages: [],
      districtName: 'পঞ্চগড়',
      upazilaName: 'বোদা',
    ),
  ];
}

