import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class InvoicingScreen extends StatefulWidget {
  const InvoicingScreen({super.key});

  @override
  State<InvoicingScreen> createState() => _InvoicingScreenState();
}

class _InvoicingScreenState extends State<InvoicingScreen> {
  final List<Map<String, dynamic>> _customers = [];

  void _showAddCustomerDialog() {
    final nameCtrl = TextEditingController();
    final compCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final gstinCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Add Customer Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: compCtrl, decoration: const InputDecoration(labelText: 'Shop / Company Name *', hintText: 'e.g. Royal Swarn Jewellers')),
              const SizedBox(height: 8),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Contact Person *', hintText: 'e.g. Vikram Shah')),
              const SizedBox(height: 8),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone Number *', hintText: '+91 98765 43210')),
              const SizedBox(height: 8),
              TextField(controller: gstinCtrl, decoration: const InputDecoration(labelText: 'GSTIN (Optional)', hintText: '27AAAAA0000A1Z5')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary),
            onPressed: () {
              if (compCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                setState(() {
                  _customers.add({
                    'id': 'cust-${DateTime.now().millisecondsSinceEpoch}',
                    'company': compCtrl.text,
                    'name': nameCtrl.text.isNotEmpty ? nameCtrl.text : compCtrl.text,
                    'phone': phoneCtrl.text,
                    'gstin': gstinCtrl.text.isNotEmpty ? gstinCtrl.text : 'UNREGISTERED',
                    'assignedItems': [],
                  });
                });
                Navigator.pop(ctx);
              }
            },
            child: const Text('Save Customer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Customers & Invoicing', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textMain),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0, top: 8.0, bottom: 8.0),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.goldPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                padding: const EdgeInsets.symmetric(horizontal: 12),
              ),
              icon: const Icon(Icons.person_add, size: 16, color: Colors.white),
              label: const Text('+ Add Customer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              onPressed: _showAddCustomerDialog,
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _customers.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(36),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('No customers found', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                        const SizedBox(height: 4),
                        const Text('Add your first customer profile to start generating B2B invoices.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted), textAlign: TextAlign.center),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                          icon: const Icon(Icons.add, size: 16, color: Colors.white),
                          label: const Text('+ Add Customer', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          onPressed: _showAddCustomerDialog,
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _customers.length,
                    itemBuilder: (context, index) {
                      final c = _customers[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppTheme.borderSubtle)),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(c['company']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFA7F3D0))),
                                    child: const Text('Verified Buyer', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text('Contact: ${c["name"]} • Phone: ${c["phone"]}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              Text('GSTIN: ${c["gstin"]}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}
