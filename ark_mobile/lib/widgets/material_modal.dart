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
  
  final _formKey = GlobalKey<FormState>();
  final _dateTimeCtrl = TextEditingController();
  final _vendorCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _priceCtrl = TextEditingController(text: '7200');
  
  // Specific inputs
  final _diamondSizeCtrl = TextEditingController();
  final _stoneSizeCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _purity = '24K';

  final List<String> _photosBase64 = [];
  final ImagePicker _picker = ImagePicker();

  final List<String> _goldPurityOptions = [
    '24K',
    '23K',
    '22K',
    '21K',
    '20K',
    '18K',
    '14K',
    '10K',
    '9K',
  ];

  @override
  void initState() {
    super.initState();
    _materialType = widget.initialCategory.toLowerCase();
    _updateDefaultPrice(_materialType);

    // Auto-populate Date & Time
    final now = DateTime.now();
    _dateTimeCtrl.text = "${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}, ${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}";
  }

  void _updateDefaultPrice(String mat) {
    if (mat == 'gold') {
      _priceCtrl.text = '7200';
      _purity = '24K';
    } else if (mat == 'diamond') {
      _priceCtrl.text = '45000';
    } else {
      _priceCtrl.text = '12000';
    }
  }

  @override
  void dispose() {
    _dateTimeCtrl.dispose();
    _vendorCtrl.dispose();
    _weightCtrl.dispose();
    _priceCtrl.dispose();
    _diamondSizeCtrl.dispose();
    _stoneSizeCtrl.dispose();
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

      final newEntry = MaterialEntry(
        id: 'tx-${DateTime.now().millisecondsSinceEpoch}',
        materialType: _materialType,
        direction: 'INWARD',
        weight: weightVal,
        purity: _materialType == 'gold' ? _purity : null,
        size: _materialType == 'diamond' ? _diamondSizeCtrl.text : (_materialType == 'gemstone' ? _stoneSizeCtrl.text : null),
        vendorName: _vendorCtrl.text.isEmpty ? 'MMTC-PAMP Bullion' : _vendorCtrl.text,
        price: priceVal,
        totalAmount: total,
        timestamp: _dateTimeCtrl.text,
        notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
        photoUrl: _photosBase64.isNotEmpty ? _photosBase64.first : null,
      );

      widget.onSubmit(newEntry);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final weightVal = double.tryParse(_weightCtrl.text) ?? 0.0;
    final priceVal = double.tryParse(_priceCtrl.text) ?? 0.0;
    final totalAmount = weightVal * priceVal;

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
                
                // Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('MATERIAL VAULT INTAKE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                        Text('Add Material Entry', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 14),

                // SEGMENTED SELECTOR AT VERY TOP
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(14)),
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
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.goldDark : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
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

                // COMMON FIELD 1: DATE & TIME (EDITABLE)
                TextFormField(
                  controller: _dateTimeCtrl,
                  decoration: const InputDecoration(
                    labelText: 'DATE & TIME (EDITABLE)',
                    prefixIcon: Icon(Icons.calendar_today, size: 18, color: AppTheme.goldDark),
                  ),
                ),

                const SizedBox(height: 12),

                // COMMON FIELD 2: VENDOR NAME
                TextFormField(
                  controller: _vendorCtrl,
                  decoration: const InputDecoration(
                    labelText: 'VENDOR NAME *',
                    hintText: 'e.g. MMTC-PAMP Bullion / Surat Syndicate',
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Vendor Name is required' : null,
                ),

                const SizedBox(height: 14),

                // DYNAMIC MATERIAL FIELDS
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.bgPrimary,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
                  child: Column(
                    children: [
                      // GOLD FIELDS
                      if (_materialType == 'gold') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (grams) *', hintText: '0.000'),
                                onChanged: (v) => setState(() {}),
                                validator: (val) {
                                  if (val == null || val.isEmpty) return 'Required';
                                  final numVal = double.tryParse(val);
                                  if (numVal == null || numVal <= 0) return 'Must be > 0';
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: _purity,
                                decoration: const InputDecoration(labelText: 'PURITY *'),
                                items: _goldPurityOptions.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                                onChanged: (val) => setState(() => _purity = val!),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER GRAM (₹) *', prefixText: '₹ '),
                          onChanged: (v) => setState(() {}),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            final numVal = double.tryParse(val);
                            if (numVal == null || numVal <= 0) return 'Must be > 0';
                            return null;
                          },
                        ),
                      ],

                      // DIAMOND FIELDS
                      if (_materialType == 'diamond') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (Carat / ct) *', hintText: '0.00 ct'),
                                onChanged: (v) => setState(() {}),
                                validator: (val) {
                                  if (val == null || val.isEmpty) return 'Required';
                                  final numVal = double.tryParse(val);
                                  if (numVal == null || numVal <= 0) return 'Must be > 0';
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextFormField(
                                controller: _diamondSizeCtrl,
                                decoration: const InputDecoration(labelText: 'DIAMOND SIZE *', hintText: 'e.g. 0.25 ct'),
                                validator: (val) => val == null || val.trim().isEmpty ? 'Mandatory for Diamonds' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER CARAT (₹) *', prefixText: '₹ '),
                          onChanged: (v) => setState(() {}),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            final numVal = double.tryParse(val);
                            if (numVal == null || numVal <= 0) return 'Must be > 0';
                            return null;
                          },
                        ),
                      ],

                      // GEMSTONE FIELDS
                      if (_materialType == 'gemstone') ...[
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _weightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (Carat / ct) *', hintText: '0.00 ct'),
                                onChanged: (v) => setState(() {}),
                                validator: (val) {
                                  if (val == null || val.isEmpty) return 'Required';
                                  final numVal = double.tryParse(val);
                                  if (numVal == null || numVal <= 0) return 'Must be > 0';
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextFormField(
                                controller: _stoneSizeCtrl,
                                decoration: const InputDecoration(labelText: 'STONE SIZE *', hintText: 'e.g. 5x7 mm'),
                                validator: (val) => val == null || val.trim().isEmpty ? 'Mandatory for Gemstones' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER CARAT (₹) *', prefixText: '₹ '),
                          onChanged: (v) => setState(() {}),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            final numVal = double.tryParse(val);
                            if (numVal == null || numVal <= 0) return 'Must be > 0';
                            return null;
                          },
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // COMMON FIELD 3: READ-ONLY AUTO-CALCULATED TOTAL AMOUNT
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF059669), width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TOTAL AMOUNT (AUTO-CALCULATED)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                          const SizedBox(height: 2),
                          Text(
                            '$weightVal ${_materialType == "gold" ? "g" : "ct"} × ₹$priceVal',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF065F46)),
                          ),
                        ],
                      ),
                      Text(
                        '₹${totalAmount.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // COMMON FIELD 4: PHOTO ATTACHMENTS CAPSULE WORKFLOW
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
