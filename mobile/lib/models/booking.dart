class Booking {
  final String id;
  final String bookingNumber;
  final String mistriId;
  final String mistriName;
  final String mistriPhone;
  final String mistriAvatar;
  final String category;
  final String workDescription;
  final String jobAddress;
  final String preferredDate;
  final String preferredTime;
  final String status; // pending, accepted, in_progress, completed, cancelled
  final num? agreedPrice;
  final num? estimatedBudget;
  final bool hasReviewed;
  final double latitude;
  final double longitude;

  const Booking({
    required this.id,
    required this.bookingNumber,
    required this.mistriId,
    required this.mistriName,
    required this.mistriPhone,
    required this.mistriAvatar,
    required this.category,
    required this.workDescription,
    required this.jobAddress,
    required this.preferredDate,
    required this.preferredTime,
    required this.status,
    this.agreedPrice,
    this.estimatedBudget,
    this.hasReviewed = false,
    this.latitude = 26.0333,
    this.longitude = 88.4667,
  });

  Booking copyWith({
    String? status,
    bool? hasReviewed,
  }) {
    return Booking(
      id: id,
      bookingNumber: bookingNumber,
      mistriId: mistriId,
      mistriName: mistriName,
      mistriPhone: mistriPhone,
      mistriAvatar: mistriAvatar,
      category: category,
      workDescription: workDescription,
      jobAddress: jobAddress,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      status: status ?? this.status,
      agreedPrice: agreedPrice,
      estimatedBudget: estimatedBudget,
      hasReviewed: hasReviewed ?? this.hasReviewed,
      latitude: latitude,
      longitude: longitude,
    );
  }

  static List<Booking> sampleBookings = [
    const Booking(
      id: 'b-1',
      bookingNumber: 'MST-261103-AB12',
      mistriId: 'm-1',
      mistriName: 'মোঃ রফিকুল ইসলাম',
      mistriPhone: '01712345678',
      mistriAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
      category: 'ইলেকট্রিশিয়ান',
      workDescription: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচবোর্ডে স্পার্ক করছে।',
      jobAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      preferredDate: '২০২৬-১১-০৩',
      preferredTime: 'সকাল ১১:০০',
      status: 'accepted',
      agreedPrice: 400,
      estimatedBudget: 400,
      hasReviewed: false,
      latitude: 26.0333,
      longitude: 88.4667,
    ),
    const Booking(
      id: 'b-2',
      bookingNumber: 'MST-261028-XY89',
      mistriId: 'm-2',
      mistriName: 'আব্দুল করিম',
      mistriPhone: '01898765432',
      mistriAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      category: 'প্লাম্বার',
      workDescription: 'পানির মোটরের ক্যাপাসিটর নষ্ট ও পাইপলাইন লিকেজ মেরামত।',
      jobAddress: 'সদর হাসপাতাল রোড, ঠাকুরগাঁও',
      preferredDate: '২০২৬-১০-২৮',
      preferredTime: 'বিকাল ৪:০০',
      status: 'completed',
      agreedPrice: 500,
      estimatedBudget: 500,
      hasReviewed: false,
      latitude: 26.0350,
      longitude: 88.4690,
    ),
  ];
}
