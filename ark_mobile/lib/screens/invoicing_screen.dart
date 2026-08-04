import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class InvoicingScreen extends StatelessWidget {
  const InvoicingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Editable B2B Invoice Generator',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain),
            ),
            const SizedBox(height: 12),

            // Paper Preview Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ARK JEWELRY CREATIONS', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFB45309))),
                  const Text('TAX INVOICE • Inv #: ARK-INV-2026-084', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const Divider(height: 24, thickness: 1),

                  const Text('BUYER (JEWELRY SHOP OWNER)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                  const SizedBox(height: 4),
                  const Text('Royal Swarn Jewellers Pvt Ltd', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black)),
                  const Text('GSTIN: 27AAAAA0000A1Z5 • Zaveri Bazaar, Mumbai', style: TextStyle(fontSize: 11, color: Colors.black87)),
                  const SizedBox(height: 16),

                  // Items Summary
                  Container(
                    padding: const EdgeInsets.all(10),
                    color: Colors.grey.shade100,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('22K Gold Antique Choker (42g)', style: TextStyle(fontSize: 12, color: Colors.black, fontWeight: FontWeight.w600)),
                        Text('₹ 3,06,600', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Final Payable Amount:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black)),
                      Text('₹ 3,15,798', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFFB45309))),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
