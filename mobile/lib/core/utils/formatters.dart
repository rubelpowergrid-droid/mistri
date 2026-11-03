class AppFormatters {
  static const Map<String, String> _bnDigits = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };

  static String toBanglaNumber(dynamic value) {
    if (value == null) return '';
    final str = value.toString();
    return str.split('').map((char) => _bnDigits[char] ?? char).join('');
  }

  static String formatBDT(num? amount, {bool isBn = true}) {
    if (amount == null) return isBn ? 'আলোচনা সাপেক্ষে' : 'Negotiable';
    final formatted = amount.toStringAsFixed(0);
    if (isBn) {
      return '৳ ${toBanglaNumber(formatted)}';
    }
    return 'BDT $formatted';
  }

  static String formatDistance(double km, {bool isBn = true}) {
    if (km < 1.0) {
      final meters = (km * 1000).round();
      return isBn ? '${toBanglaNumber(meters)} মিটার' : '${meters}m';
    }
    final formatted = km.toStringAsFixed(1);
    return isBn ? '${toBanglaNumber(formatted)} কিমি' : '${formatted}km';
  }
}

