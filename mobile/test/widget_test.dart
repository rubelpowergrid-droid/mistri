import 'package:flutter_test/flutter_test.dart';
import 'package:mistri/main.dart';
import 'package:mistri/screens/customer/home_screen.dart';

void main() {
  testWidgets('MistriApp launches and renders CustomerHomeScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MistriApp());

    // Verify CustomerHomeScreen is rendered
    expect(find.byType(CustomerHomeScreen), findsOneWidget);
  });
}
