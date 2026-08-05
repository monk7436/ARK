import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';

class MaterialModal extends StatefulWidget {
  final String initialDirection;
  final String initialCategory;
  final List<dynamic> manufacturers;
  final Function(MaterialEntry) onSubmit;

  const MaterialModal({
    super.key,
    this.initialDirection = 'INWARD',
    this.initialCategory = 'gold',
    required this.manufacturers,
    required this.onSubmit,
  });

  @override
  State<MaterialModal> createState() => _MaterialModalState();
}

class _MaterialModalState extends State<MaterialModal> {
  late String _materialType; // 'gold', 'diamond', 'gemstone'
  late String _direction;    // 'INWARD' or 'OUTWARD'

  final _formKey = GlobalKey<FormState>();
  final _weightCtrl = TextEditingController();
  final _priceCtrl = TextEditingController(text: '7200');
  final _vendorCtrl = TextEditingController();
  final _diamondSizeCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _purity = '24K - 995';
  String _gemstoneType = 'Ruby';
  String? _selectedManufacturerId;
  DateTime? _expectedReturnDate;

  final List<String> _photosBase64 = [];
  final ImagePicker _picker = ImagePicker();

  final List<String> _goldPurityOptions = [
    '24K - 995',
    '24K - 999',
    '22K - 916',
    '20K - 833',
    '18K - 750',
    '14K - 585',
    '9K - 375',
  ];

  @override
  void initState() {
    super.initState();
    _direction = widget.initialDirection;
    _materialType = widget.initialCategory.toLowerCase();
    _updateDefaultPrice(_materialType);
  }

  void _updateDefaultPrice(String mat) {
    if (mat == 'gold') {
      _priceCtrl.text = '7200';
      _purity = '24K - 995';
    } else if (mat == 'diamond') {
      _priceCtrl.text = '45000';
    } else {
      _priceCtrl.text = '12000';
    }
  }

  @override
  void dispose() {
    _weightCtrl.dispose();
    _priceCtrl.dispose();
    _vendorCtrl.dispose();
    _diamondSizeCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  void _showAttachmentBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Attach Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.camera);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.camera_alt_outlined, color: AppTheme.goldDark, size: 28),
                          SizedBox(height: 8),
                          Text('Take Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.gallery);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.photo_library_outlined, color: Color(0xFF2563EB), size: 28),
                          SizedBox(height: 8),
                          Text('Choose From Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.camera) {
        final XFile? image = await _picker.pickImage(source: source, imageQuality: 70);
        if (image != null) {
          final bytes = await image.readAsBytes();
          setState(() {
            if (_photosBase64.length < 3) {
              _photosBase64.add('data:image/jpeg;base64,${base64Encode(bytes)}');
            }
          });
        }
      } else {
        final List<XFile> images = await _picker.pickMultiImage(imageQuality: 70);
        for (var img in images) {
          if (_photosBase64.length >= 3) break;
          final bytes = await img.readAsBytes();
          _photosBase64.add('data:image/jpeg;base64,${base64Encode(bytes)}');
        }
        setState(() {});
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final weightVal = double.tryParse(_weightCtrl.text) ?? 0.0;
      final priceVal = double.tryParse(_priceCtrl.text) ?? 0.0;
      final total = weightVal * priceVal;

      String finalVendor = _direction == 'INWARD'
          ? (_vendorCtrl.text.isEmpty ? 'MMTC-PAMP Bullion' : _vendorCtrl.text)
          : 'Artisan Workshop';

      if (_direction == 'OUTWARD' && _selectedManufacturerId != null) {
        final mfg = widget.manufacturers.firstWhere(
          (m) => m.id == _selectedManufacturerId,
          orElse: () => null,
        );
        if (mfg != null) finalVendor = mfg.name;
      }

      final newEntry = MaterialEntry(
        id: 'tx-${DateTime.now().millisecondsSinceEpoch}',
        materialType: _materialType,
        direction: _direction,
        weight: weightVal,
        purity: _materialType == 'gold' ? _purity : null,
        vendorName: finalVendor,
        price: priceVal,
        totalAmount: total,
        timestamp: DateTime.now().toString().substring(0, 16),
        notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
        photoUrl: _photosBase64.isNotEmpty ? _photosBase64.first : null,
      );

      widget.onSubmit(newEntry);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 460),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                
                // Modal Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('UNIVERSAL VAULT ENTRY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                        Text('Record Vault Entry', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 14),

                // STEP 1: MATERIAL SELECTION (SEGMENTED CONTROL)
                const Text('STEP 1: SELECT MATERIAL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: ['gold', 'diamond', 'gemstone'].map((cat) {
                      final isSelected = _materialType == cat;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _materialType = cat;
                              _updateDefaultPrice(cat);
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.goldDark : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              cat.toUpperCase(),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                color: isSelected ? Colors.white : AppTheme.textMuted,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),

                const SizedBox(height: 14),

                // STEP 2: ENTRY TYPE (SEGMENTED CONTROL)
                const Text('STEP 2: ENTRY TYPE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _direction = 'INWARD'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _direction == 'INWARD' ? const Color(0xFFECFDF5) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _direction == 'INWARD' ? const Color(0xFF059669) : AppTheme.borderSubtle,
                              width: _direction == 'INWARD' ? 2 : 1,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.arrow_downward, size: 16, color: Color(0xFF059669)),
                              SizedBox(width: 4),
                              Text('Inward (Intake)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF059669))),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _direction = 'OUTWARD'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _direction == 'OUTWARD' ? const Color(0xFFFEF2F2) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _direction == 'OUTWARD' ? const Color(0xFFDC2626) : AppTheme.borderSubtle,
                              width: _direction == 'OUTWARD' ? 2 : 1,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.arrow_upward, size: 16, color: Color(0xFFDC2626)),
                              SizedBox(width: 4),
                              Text('Outward (Issue)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFFDC2626))),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // STEP 3: DYNAMIC FIELDS
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.bgPrimary,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
                  child: Column(
                    children: [
                      // Vendor or Karigar Selection
                      _direction == 'INWARD'
                          ? TextFormField(
                              controller: _vendorCtrl,
                              decoration: const InputDecoration(labelText: 'VENDOR / SUPPLIER', hintText: 'e.g. MMTC-PAMP Bullion'),
                            )
                          : DropdownButtonFormField<String>(
                              value: _selectedManufacturerId,
                              decoration: const InputDecoration(labelText: 'ASSIGNED KARIGAR'),
                              items: widget.manufacturers.map((m) {
                                return DropdownMenuItem<String>(
                                  value: m.id,
                                  child: Text(m.name),
                                );
                              }).toList(),
                              onChanged: (val) => setState(() => _selectedManufacturerId = val),
                            ),
                      const SizedBox(height: 10),

                      // Gold Combination
                      if (_materialType == 'gold') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (g)', hintText: '0.000'),
                                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _purity,
                                decoration: const InputDecoration(labelText: 'GOLD PURITY'),
                                items: _goldPurityOptions.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                                onChanged: (val) => setState(() => _purity = val!),
                              ),
                            ),
                          ],
                        ),
                      ],

                      // Diamond Combination
                      if (_materialType == 'diamond') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (CTS)', hintText: '0.00'),
                                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextFormField(
                                controller: _diamondSizeCtrl,
                                decoration: const InputDecoration(labelText: 'SIEVE / SIZE', hintText: 'e.g. 2.5 mm'),
                              ),
                            ),
                          ],
                        ),
                      ],

                      // Gemstone Combination
                      if (_materialType == 'gemstone') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (CTS)', hintText: '0.00'),
                                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _gemstoneType,
                                decoration: const InputDecoration(labelText: 'GEMSTONE TYPE'),
                                items: ['Ruby', 'Emerald', 'Sapphire', 'Pearl'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                                onChanged: (val) => setState(() => _gemstoneType = val!),
                              ),
                            ),
                          ],
                        ),
                      ],

                      const SizedBox(height: 10),

                      // Rate
                      TextFormField(
                        controller: _priceCtrl,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(labelText: 'RATE (₹ / ${_materialType == "gold" ? "g" : "CTS"})'),
                        validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                      ),

                      const SizedBox(height: 10),

                      // Notes
                      TextFormField(
                        controller: _notesCtrl,
                        decoration: const InputDecoration(labelText: 'REMARKS / NOTES', hintText: 'Optional tag details...'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // REDESIGNED PHOTO ATTACHMENT CAPSULE BUTTON
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PHOTO ATTACHMENTS (${_photosBase64.length}/3)', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      ),
                      onPressed: _showAttachmentBottomSheet,
                      icon: const Icon(Icons.add, size: 16, color: AppTheme.goldDark),
                      label: const Text('+ Add Photos', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                    ),
                  ],
                ),

                if (_photosBase64.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: _photosBase64.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final base64Str = entry.value;
                      return Stack(
                        children: [
                          Container(
                            margin: const EdgeInsets.only(right: 8),
                            width: 60, height: 60,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.borderSubtle),
                              image: DecorationImage(
                                image: MemoryImage(base64Decode(base64Str.split(',').last)),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          Positioned(
                            top: 2, right: 10,
                            child: GestureDetector(
                              onTap: () => setState(() => _photosBase64.removeAt(idx)),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                child: const Icon(Icons.close, size: 12, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 18),

                // SAVE ENTRY BUTTON
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.goldPrimary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _submit,
                    child: Text('SAVE ${_materialType.toUpperCase()} ENTRY', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ),

              ],
            ),
          ),
        ),
      ),
    );
  }
}
