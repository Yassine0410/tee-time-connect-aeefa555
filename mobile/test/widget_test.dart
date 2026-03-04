import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/app.dart';

void main() {
  testWidgets('App starts on auth screen', (WidgetTester tester) async {
    await tester.pumpWidget(const TeeTimeApp());
    await tester.pumpAndSettle();

    expect(find.text('Connexion'), findsOneWidget);
  });
}
