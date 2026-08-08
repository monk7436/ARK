import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';
import 'diamond_item_input.dart';

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
  final _goldWeightCtrl = TextEditingController();
  final _priceCtrl = TextEditingController(text: '7200');
  final _notesCtrl = TextEditingController();

  String _purity = '24K';

  // Multi-row Structured Diamond items
  List<DiamondItemInputData> _diamondInputs = [];
  // Multi-row Gemstone items
  List<Map<String, TextEditingController>> _gemstoneRows = [];

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
    
    _diamondInputs = [
      DiamondItemInputData(
        id: 'd-${DateTime.now().millisecondsSinceEpoch}',
        weightCtrl: TextEditingController(),
        sizeMm: 2.5,
        shape: 'Round',
        customShapeCtrl: TextEditingController(),
      )
    ];

    _gemstoneRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
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

  void _addDiamondRow() {
    setState(() {
      _diamondInputs.add(
        DiamondItemInputData(
          id: 'd-${DateTime.now().millisecondsSinceEpoch}-${_diamondInputs.length}',
          weightCtrl: TextEditingController(),
          sizeMm: 2.5,
          shape: 'Round',
          customShapeCtrl: TextEditingController(),
        ),
      );
    });
  }

  void _removeDiamondRow(int index) {
    if (_diamondInputs.length > 1) {
      setState(() {
        _diamondInputs[index].dispose();
        _diamondInputs.removeAt(index);
      });
    }
  }

  void _addGemstoneRow() {
    setState(() {
      _gemstoneRows.add({'weight': TextEditingController(), 'size': TextEditingController()});
    });
  }

  void _removeGemstoneRow(int index) {
    if (_gemstoneRows.length > 1) {
      setState(() {
        _gemstoneRows.removeAt(index);
      });
    }
  }

  @override
  void dispose() {
    _dateTimeCtrl.dispose();
    _vendorCtrl.dispose();
    _goldWeightCtrl.dispose();
    _priceCtrl.dispose();
    _notesCtrl.dispose();
    for (var d in _diamondInputs) {
      d.dispose();
    }
    for (var r in _gemstoneRows) {
      r['weight']?.dispose();
      r['size']?.dispose();
    }
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
                      child: const Column(
                        children: [
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
                      child: const Column(
                        children: [
                          Icon(Icons.photo_library_outlined, color: Color(0xFF2563EB), size: 28),
                          SizedBox(height: 8),
                          Text('Choose Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
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
      final parentId = 'tx-${DateTime.now().millisecondsSinceEpoch}';
      
      double totalCalculatedWeight = 0.0;
      List<DiamondItem> dItems = [];
      List<GemstoneItem> gItems = [];

      if (_materialType == 'gold') {
        totalCalculatedWeight = double.tryParse(_goldWeightCtrl.text) ?? 0.0;
      } else if (_materialType == 'diamond') {
        dItems = _diamondInputs
            .where((d) => (double.tryParse(d.weightCtrl.text) ?? 0.0) > 0)
            .map((d) {
              final w = double.tryParse(d.weightCtrl.text) ?? 0.0;
              totalCalculatedWeight += w;
              return DiamondItem(
                id: d.id,
                parentId: parentId,
                weightCt: w,
                sizeMm: d.sizeMm,
                shape: d.shape,
                customShape: d.shape == 'Other' ? d.customShapeCtrl.text : null,
              );
            }).toList();
      } else {
        gItems = _gemstoneRows
            .where((r) => r['weight']!.text.isNotEmpty || r['size']!.text.isNotEmpty)
            .map((r) {
              final w = double.tryParse(r['weight']!.text) ?? 0.0;
              totalCalculatedWeight += w;
              return GemstoneItem(
                id: 'g-item-${DateTime.now().microsecondsSinceEpoch}',
                parentId: parentId,
                weight: w,
                size: r['size']!.text.isEmpty ? 'Standard' : r['size']!.text,
                stoneType: 'Gemstone',
              );
            }).toList();
      }

      final priceVal = double.tryParse(_priceCtrl.text) ?? 0.0;
      final total = totalCalculatedWeight * priceVal;

      final newEntry = MaterialEntry(
        id: parentId,
        materialType: _materialType,
        direction: 'INWARD',
        weight: totalCalculatedWeight,
        purity: _materialType == 'gold' ? _purity : null,
        vendorName: _vendorCtrl.text.isEmpty ? 'Surat Diamond Syndicate' : _vendorCtrl.text,
        price: priceVal,
        totalAmount: total,
        timestamp: _dateTimeCtrl.text,
        notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
        photoUrl: _photosBase64.isNotEmpty ? _photosBase64.first : null,
        diamondItems: dItems,
        gemstoneItems: gItems,
      );

      widget.onSubmit(newEntry);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    double totalCalculatedWeight = 0.0;
    if (_materialType == 'gold') {
      totalCalculatedWeight = double.tryParse(_goldWeightCtrl.text) ?? 0.0;
    } else if (_materialType == 'diamond') {
      for (var d in _diamondInputs) {
        totalCalculatedWeight += double.tryParse(d.weightCtrl.text) ?? 0.0;
      }
    } else {
      for (var r in _gemstoneRows) {
        totalCalculatedWeight += double.tryParse(r['weight']!.text) ?? 0.0;
      }
    }

    final priceVal = double.tryParse(_priceCtrl.text) ?? 0.0;
    final totalAmount = totalCalculatedWeight * priceVal;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
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
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                    prefixIcon: Icon(Icons.calendar_today_outlined, size: 16, color: AppTheme.goldDark),
                  ),
                ),

                const SizedBox(height: 12),

                // COMMON FIELD 2: VENDOR NAME
                TextFormField(
                  controller: _vendorCtrl,
                  decoration: const InputDecoration(
                    labelText: 'VENDOR NAME *',
                    hintText: 'e.g. Surat Diamond Syndicate / MMTC-PAMP Bullion',
                  ),
                  validator: (val) => val == null || val.isEmpty ? 'Vendor name is required' : null,
                ),

                const SizedBox(height: 14),

                // DYNAMIC MATERIAL FIELDS

                // 1. GOLD FIELDS
                if (_materialType == 'gold') ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBE8),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFEF08A)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: TextFormField(
                                controller: _goldWeightCtrl,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'WEIGHT (g) *', hintText: '0.000'),
                                validator: (val) => val == null || val.isEmpty ? 'Weight is required' : null,
                                onChanged: (_) => setState(() {}),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: DropdownButtonFormField<String>(
                                isExpanded: true,
                                initialValue: _purity,
                                decoration: const InputDecoration(labelText: 'PURITY *'),
                                items: _goldPurityOptions.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => _purity = val);
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER GRAM (₹) *', prefixText: '₹ '),
                          validator: (val) => val == null || val.isEmpty ? 'Price is required' : null,
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                ],

                // 2. STRUCTURED DIAMOND MULTI-ROW (+ ADD MORE)
                if (_materialType == 'diamond') ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFBFDBFE)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'DIAMOND ITEMS (${_diamondInputs.length} ROWS)',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                            ),
                            Text(
                              'Total: ${totalCalculatedWeight.toStringAsFixed(2)} ct',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        for (int idx = 0; idx < _diamondInputs.length; idx++)
                          DiamondItemInput(
                            index: idx,
                            data: _diamondInputs[idx],
                            showRemove: _diamondInputs.length > 1,
                            onRemove: () => _removeDiamondRow(idx),
                            onWeightChanged: (_) => setState(() {}),
                            onSizeChanged: (_) => setState(() {}),
                            onShapeChanged: (_) => setState(() {}),
                          ),

                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 38),
                            backgroundColor: Colors.white,
                            side: const BorderSide(color: Color(0xFF93C5FD)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: _addDiamondRow,
                          icon: const Icon(Icons.add, size: 15, color: Color(0xFF2563EB)),
                          label: const Text('+ Add More Diamond Item', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ),

                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER CARAT (₹) *', prefixText: '₹ '),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                ],

                // 3. GEMSTONE MULTI-ROW (+ ADD MORE)
                if (_materialType == 'gemstone') ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF5FF),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE9D5FF)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('GEMSTONE ITEMS (${_gemstoneRows.length} ROWS)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8))),
                        const SizedBox(height: 8),

                        for (int idx = 0; idx < _gemstoneRows.length; idx++)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _gemstoneRows[idx]['weight'],
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    decoration: const InputDecoration(labelText: 'Weight (ct)', hintText: '0.00'),
                                    onChanged: (_) => setState(() {}),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextFormField(
                                    controller: _gemstoneRows[idx]['size'],
                                    decoration: const InputDecoration(labelText: 'Size', hintText: '5x7 mm'),
                                  ),
                                ),
                                if (_gemstoneRows.length > 1)
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
                                    onPressed: () => _removeGemstoneRow(idx),
                                  ),
                              ],
                            ),
                          ),

                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 38),
                            backgroundColor: Colors.white,
                            side: const BorderSide(color: Color(0xFFD8B4FE)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: _addGemstoneRow,
                          icon: const Icon(Icons.add, size: 15, color: Color(0xFF9333EA)),
                          label: const Text('+ Add More Gemstone Item', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF9333EA))),
                        ),

                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'PRICE PER CARAT (₹) *', prefixText: '₹ '),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // COMMON FIELD 3: READ-ONLY AUTO-CALCULATED TOTAL
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF059669)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TOTAL AMOUNT (AUTO-CALCULATED)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                          const SizedBox(height: 2),
                          Text('${totalCalculatedWeight.toStringAsFixed(2)} ${_materialType == "gold" ? "g" : "ct"} × ₹${priceVal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 10, color: Color(0xFF065F46))),
                        ],
                      ),
                      Text('₹${totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // COMMON FIELD 4: PHOTO ATTACHMENTS
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PHOTO ATTACHMENTS (${_photosBase64.length}/3)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    InkWell(
                      onTap: _showAttachmentBottomSheet,
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(999), border: Border.all(color: AppTheme.borderSubtle)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, size: 14, color: AppTheme.goldDark),
                            SizedBox(width: 4),
                            Text('+ Add Photos', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                if (_photosBase64.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _photosBase64.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final b64 = entry.value;
                      return Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              base64Decode(b64.split(',').last),
                              width: 60, height: 60, fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 2, right: 2,
                            child: InkWell(
                              onTap: () => setState(() => _photosBase64.removeAt(idx)),
                              child: Container(
                                decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                padding: const EdgeInsets.all(2),
                                child: const Icon(Icons.close, size: 12, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 12),

                // COMMON FIELD 5: NOTES
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'NOTES (OPTIONAL)', hintText: 'Purity details, vendor remarks...'),
                ),

                const SizedBox(height: 18),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.goldDark,
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
