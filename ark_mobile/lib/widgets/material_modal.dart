import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/material_entry.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class MaterialModalBottomSheet extends StatefulWidget {
  final String defaultCategory;
  const MaterialModalBottomSheet({super.key, this.defaultCategory = 'gold'});

  @override
  State<MaterialModalBottomSheet> createState() => _MaterialModalBottomSheetState();
}

class _MaterialModalBottomSheetState extends State<MaterialModalBottomSheet> {
  String direction = 'INWARD'; // INWARD or OUTWARD
  late String materialType;
  
  final _weightController = TextEditingController();
  final _vendorController = TextEditingController();
  final _priceController = TextEditingController();
  final _sizeController = TextEditingController();
  
  String? selectedManufacturerId;
  String productType = 'Ring';

  @override
  void initState() {
    super.initState();
    materialType = widget.defaultCategory;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final timestamp = DateFormat('dd/MM/yyyy, hh:mm a').format(DateTime.now());
    
    double weight = double.tryParse(_weightController.text) ?? 0.0;
    double price = double.tryParse(_priceController.text) ?? 0.0;
    double totalAmount = weight * price;

    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Record Material Entry',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                    ),
                    Text(
                      'Auto-timestamp: $timestamp',
                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.textDim),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Inward vs Outward Selector
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => direction = 'INWARD'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: direction == 'INWARD' ? const Color(0x2610B981) : AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: direction == 'INWARD' ? AppTheme.inwardGreen : AppTheme.borderSubtle,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.arrow_downward, color: direction == 'INWARD' ? AppTheme.inwardGreen : AppTheme.textDim, size: 18),
                          const SizedBox(width: 6),
                          Text(
                            'Inward (Store Intake)',
                            style: TextStyle(
                              color: direction == 'INWARD' ? AppTheme.inwardGreen : AppTheme.textDim,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => direction = 'OUTWARD'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: direction == 'OUTWARD' ? const Color(0x26F43F5E) : AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: direction == 'OUTWARD' ? AppTheme.outwardRose : AppTheme.borderSubtle,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.arrow_upward, color: direction == 'OUTWARD' ? AppTheme.outwardRose : AppTheme.textDim, size: 18),
                          const SizedBox(width: 6),
                          Text(
                            'Outward (Issue Karigar)',
                            style: TextStyle(
                              color: direction == 'OUTWARD' ? AppTheme.outwardRose : AppTheme.textDim,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Material Category Selector
            const Text('MATERIAL CATEGORY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
            const SizedBox(height: 6),
            Row(
              children: ['gold', 'diamond', 'gemstone'].map((cat) {
                final isSelected = materialType == cat;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => materialType = cat),
                    child: Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.goldGlow : AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSelected ? AppTheme.goldPrimary : AppTheme.borderSubtle),
                      ),
                      child: Center(
                        child: Text(
                          cat.toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? AppTheme.goldPrimary : AppTheme.textMuted,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 14),

            // Weight & Purity
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _weightController,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      labelText: materialType == 'gold' ? 'WEIGHT (GRAMS)' : 'WEIGHT (CARATS)',
                      hintText: '0.000',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: materialType == 'gold'
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                          decoration: BoxDecoration(
                            color: AppTheme.bgPrimary,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.borderSubtle),
                          ),
                          child: const Text(
                            '995 (24K Gold)',
                            style: TextStyle(color: AppTheme.goldPrimary, fontWeight: FontWeight.bold),
                          ),
                        )
                      : TextField(
                          controller: _sizeController,
                          decoration: const InputDecoration(
                            labelText: 'SIZE (MM / SIEVE)',
                            hintText: '2.5 mm',
                          ),
                        ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Vendor / Manufacturer Name
            if (direction == 'INWARD')
              TextField(
                controller: _vendorController,
                decoration: const InputDecoration(
                  labelText: 'VENDOR / SUPPLIER NAME',
                  hintText: 'e.g. MMTC-PAMP / Surat Syndicate',
                ),
              )
            else
              DropdownButtonFormField<String>(
                initialValue: selectedManufacturerId,
                dropdownColor: AppTheme.bgCard,
                decoration: const InputDecoration(labelText: 'ASSIGNED MANUFACTURER (KARIGAR)'),
                items: appState.manufacturers.map((m) {
                  return DropdownMenuItem(
                    value: m.id,
                    child: Text('${m.name} (${m.office})'),
                  );
                }).toList(),
                onChanged: (val) => setState(() => selectedManufacturerId = val),
              ),
            const SizedBox(height: 14),

            // Price Rate & Total Amount
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _priceController,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      labelText: materialType == 'gold' ? 'RATE (₹ / GRAM)' : 'RATE (₹ / CARAT)',
                      hintText: '7200',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.bgPrimary,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TOTAL AMOUNT', style: TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(
                          '₹ ${totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppTheme.inwardGreen, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Product Type (For Outward entries)
            if (direction == 'OUTWARD') ...[
              DropdownButtonFormField<String>(
                initialValue: productType,
                dropdownColor: AppTheme.bgCard,
                decoration: const InputDecoration(labelText: 'PRODUCT TYPE TO MANUFACTURE'),
                items: ['Ring', 'Necklace', 'Bangle', 'Pendant', 'Earrings'].map((t) {
                  return DropdownMenuItem(value: t, child: Text(t));
                }).toList(),
                onChanged: (val) => setState(() => productType = val!),
              ),
              const SizedBox(height: 14),
            ],

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  final vendorNameStr = direction == 'INWARD' 
                      ? (_vendorController.text.isEmpty ? 'General Supplier' : _vendorController.text)
                      : (appState.manufacturers.firstWhere((m) => m.id == selectedManufacturerId, orElse: () => appState.manufacturers.first).name);

                  final newEntry = MaterialEntry(
                    id: 'tx-${DateTime.now().millisecondsSinceEpoch}',
                    timestamp: timestamp,
                    direction: direction,
                    materialType: materialType,
                    weight: weight,
                    purity: materialType == 'gold' ? '995 (24K)' : null,
                    size: materialType != 'gold' ? _sizeController.text : null,
                    vendorName: vendorNameStr,
                    manufacturerId: selectedManufacturerId,
                    price: price,
                    totalAmount: totalAmount,
                    productType: direction == 'OUTWARD' ? productType : null,
                    photoUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
                  );

                  appState.addMaterialEntry(newEntry);
                  Navigator.pop(context);
                },
                child: const Text(
                  'SUBMIT MATERIAL ENTRY',
                  style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
