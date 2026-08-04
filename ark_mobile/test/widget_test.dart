import 'package:flutter_test/flutter_test.dart';
import 'package:ark_mobile/main.dart';

void main() {
  testWidgets('ARK App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ArkApp());
    expect(find.byType(ArkApp), findsOneWidget);
  });
}
