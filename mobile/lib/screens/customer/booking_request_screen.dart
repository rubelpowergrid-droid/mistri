import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/mistri.dart';
import '../../models/booking.dart';
import 'bookings_list_screen.dart';

class BookingRequestScreen extends StatefulWidget {
  final Mistri mistri;

  const BookingRequestScreen({super.key, required this.mistri});

  @override
  State<BookingRequestScreen> createState() => _BookingRequestScreenState();
}

class _BookingRequestScreenState extends State<BookingRequestScreen> {
  final TextEditingController _descCtrl = TextEditingController();
  final TextEditingController _addressCtrl = TextEditingController(text: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর');
  final TextEditingController _phoneCtrl = TextEditingController(text: '01700112233');
  final TextEditingController _budgetCtrl = TextEditingController();

  DateTime _selectedDate = DateTime.now();
  String _selectedTime = 'সকাল ১১:০০';
  bool _isSubmitting = false;

  final List<String> _timeSlots = [
    'সকাল ৯:০০',
    'সকাল ১১:০০',
    'দুপুর ২:০০',
    'বিকাল ৪:০০',
    'সন্ধ্যা ৬:০০',
  ];

  Future<void> _submitBooking() async {
    if (_descCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('অনুগ্রহ করে কাজের বিবরণ লিখুন')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 1000));

    final newBooking = Booking(
      id: 'b-${DateTime.now().millisecondsSinceEpoch}',
      bookingNumber: 'MST-261103-${(1000 + DateTime.now().millisecond)}',
      mistriId: widget.mistri.id,
      mistriName: widget.mistri.name,
      mistriPhone: widget.mistri.phone,
      mistriAvatar: widget.mistri.avatarUrl,
      category: widget.mistri.category,
      workDescription: _descCtrl.text.trim(),
      jobAddress: _addressCtrl.text.trim(),
      preferredDate: '${_selectedDate.year}-${_selectedDate.month}-${_selectedDate.day}',
      preferredTime: _selectedTime,
      status: 'pending',
      estimatedBudget: num.tryParse(_budgetCtrl.text.trim()) ?? widget.mistri.hourlyRate,
      hasReviewed: false,
    );

    Booking.sampleBookings.insert(0, newBooking);

    setState(() => _isSubmitting = false);

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const BookingsListScreen(showSuccessBanner: true),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: const Text('বুকিং অনুরোধ তৈরি'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mistri Mini Summary
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        widget.mistri.avatarUrl,
                        height: 52,
                        width: 52,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.mistri.name,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            widget.mistri.title,
                            style: const TextStyle(fontSize: 11, color: AppTheme.slate600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'ভিজিট ফি: ${AppFormatters.formatBDT(widget.mistri.hourlyRate)}',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryBlue,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Form Content
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('কাজের বিবরণ (সমস্যা বর্ণনা করুন)*', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _descCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'সমস্যাটি বিস্তারিত লিখুন (যেমন: সিলিং ফ্যান স্পার্ক করছে বা পানির পাইপ লিক করছে)...',
                      ),
                    ),
                    const SizedBox(height: 16),

                    const Text('কাজের ঠিকানা (Job Location)*', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _addressCtrl,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.location_on, color: AppTheme.primaryBlue, size: 20),
                        hintText: 'বাড়ি নং, রোড, এলাকা, উপজেলা...',
                      ),
                    ),
                    const SizedBox(height: 16),

                    const Text('পছন্দের তারিখ ও সময়সূচি*', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.calendar_today, size: 16, color: AppTheme.primaryBlue),
                            label: Text(
                              '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                            ),
                            onPressed: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _selectedDate,
                                firstDate: DateTime.now(),
                                lastDate: DateTime.now().add(const Duration(days: 30)),
                              );
                              if (picked != null) {
                                setState(() => _selectedDate = picked);
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Time Slots
                    Wrap(
                      spacing: 8,
                      children: _timeSlots.map((slot) {
                        final isSel = _selectedTime == slot;
                        return ChoiceChip(
                          label: Text(slot, style: TextStyle(fontSize: 11, color: isSel ? Colors.white : AppTheme.slate900)),
                          selected: isSel,
                          selectedColor: AppTheme.primaryBlue,
                          onSelected: (_) => setState(() => _selectedTime = slot),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    const Text('যোগাযোগের ফোন নম্বর*', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _phoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.phone, color: AppTheme.slate400, size: 20),
                        hintText: '01XXXXXXXXX',
                      ),
                    ),
                    const SizedBox(height: 16),

                    const Text('প্রস্তাবিত বাজেট (ঐচ্ছিক)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _budgetCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.currency_lira, color: AppTheme.slate400, size: 20),
                        hintText: 'টাকা (BDT)',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitBooking,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('অনুরোধ নিশ্চিত করুন (Send Request)'),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

