import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
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
  
  String selectedPurity = '24K - 995 (99.5% Store Standard)';
  String? selectedManufacturerId;
  String productType = 'Ring';

  final ImagePicker _picker = ImagePicker();
  final List<XFile> _selectedImages = [];

  static const List<String> goldPurityOptions = [
    '24K - 995 (99.5% Store Standard)',
    '24K - 999 (99.9% Fine Gold)',
    '22K - 916 (91.6% Hallmarked)',
    '20K - 833 (83.3%)',
    '18K - 750 (75.0% Fine)',
    '14K - 585 (58.5% Fine)',
    '9K - 375 (37.5% Fine)',
  ];

  @override
  void initState() {
    super.initState();
    materialType = widget.defaultCategory.toLowerCase();
    _priceController.text = materialType == 'gold' ? '7200' : (materialType == 'diamond' ? '45000' : '12000');
  }

  Future<void> _pickImage(ImageSource source) async {
    if (_selectedImages.length >= 3) return;
    try {
      final XFile? photo = await _picker.pickImage(source: source, imageQuality: 80);
      if (photo != null) {
        setState(() {
          _selectedImages.add(photo);
        });
      }
    } catch (e) {
      print('Error picking image: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final timestamp = DateFormat('dd/MM/yyyy, hh:mm a').format(DateTime.now());
    
    double weight = double.tryParse(_weightController.text) ?? 0.0;
    double price = double.tryParse(_priceController.text) ?? 0.0;
    double totalAmount = weight * price;
    final catTitle = materialType.toUpperCase();

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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('$catTitle VAULT ENTRY', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Record $catTitle Entry',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain),
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

            // Inward vs Outward Toggle
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
                              fontSize: 12,
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
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
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
                      ? DropdownButtonFormField<String>(
                          value: selectedPurity,
                          isExpanded: true,
                          dropdownColor: AppTheme.bgCard,
                          decoration: const InputDecoration(labelText: 'GOLD PURITY SELECTION'),
                          items: goldPurityOptions.map((p) {
                            return DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.goldDark)));
                          }).toList(),
                          onChanged: (val) => setState(() => selectedPurity = val!),
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

            // Vendor / Karigar
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
                value: selectedManufacturerId,
                dropdownColor: AppTheme.bgCard,
                decoration: const InputDecoration(labelText: 'ASSIGNED KARIGAR / MANUFACTURER'),
                items: appState.manufacturers.map((m) {
                  return DropdownMenuItem(
                    value: m.id,
                    child: Text('${m.name} (${m.office})'),
                  );
                }).toList(),
                onChanged: (val) => setState(() => selectedManufacturerId = val),
              ),
            const SizedBox(height: 14),

            // Price & Total Amount
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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

            // Photo Attachments (Camera & Gallery picker)
            const Text('PHOTO ATTACHMENTS (MAX 3)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
            const SizedBox(height: 6),
            Row(
              children: [
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.textMain, elevation: 1),
                  onPressed: () => _pickImage(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt, size: 18),
                  label: const Text('Camera', style: TextStyle(fontSize: 12)),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.textMain, elevation: 1),
                  onPressed: () => _pickImage(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library, size: 18),
                  label: const Text('Gallery', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 16),

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
                      ? (_vendorController.text.isEmpty ? 'MMTC-PAMP Bullion Supplier' : _vendorController.text)
                      : (appState.manufacturers.firstWhere((m) => m.id == selectedManufacturerId, orElse: () => appState.manufacturers.first).name);

                  final newEntry = MaterialEntry(
                    id: 'tx-${DateTime.now().millisecondsSinceEpoch}',
                    timestamp: timestamp,
                    direction: direction,
                    materialType: materialType,
                    weight: weight,
                    purity: materialType == 'gold' ? selectedPurity : null,
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
                child: Text(
                  'SAVE $catTitle ENTRY',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
