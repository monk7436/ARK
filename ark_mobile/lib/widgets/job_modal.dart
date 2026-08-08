import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../models/material_entry.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import 'diamond_item_input.dart';

class JobModal extends StatefulWidget {
  final JobEntry? initialJob;
  final List<dynamic> manufacturers;
  final String nextJobNumber;
  final Function(JobEntry) onSubmit;

  const JobModal({
    super.key,
    this.initialJob,
    required this.manufacturers,
    required this.nextJobNumber,
    required this.onSubmit,
  });

  @override
  State<JobModal> createState() => _JobModalState();
}

class _JobModalState extends State<JobModal> {
  final _formKey = GlobalKey<FormState>();

  // Locked Fields
  late String _jobNumber;
  late String _dateTime;
  String _manufacturerId = '';
  final _productNameCtrl = TextEditingController();

  // 1. Gold Section (Always starts with 24K, optional)
  final _goldWeightCtrl = TextEditingController();
  String _goldPurity = '24K';

  // 2. Structured Diamond Section (Starts completely empty by default)
  List<DiamondItemInputData> _diamondInputs = [];

  // 3. Gemstone Section (Starts completely empty by default)
  List<Map<String, TextEditingController>> _gemstoneRows = [];

  // 4. Photo Attachments
  final List<String> _photosBase64 = [];
  final ImagePicker _picker = ImagePicker();

  // 5. Notes
  final _notesCtrl = TextEditingController();

  // Shortfall error message if stock insufficient
  String? _stockErrorMessage;
  String? _validationErrorMessage;

  // Gold purity dropdown starts with 24K
  final List<String> _goldPurityOptions = ['24K', '22K', '18K', '14K', '9K'];

  @override
  void initState() {
    super.initState();
    final isEditing = widget.initialJob != null;

    if (isEditing) {
      final j = widget.initialJob!;
      _jobNumber = j.jobNumber;
      _dateTime = j.timestamp;
      _manufacturerId = j.manufacturerId ?? '';
      _productNameCtrl.text = j.productName;
      _goldWeightCtrl.text = j.goldWeight > 0 ? j.goldWeight.toString() : '';
      _goldPurity = j.goldPurity;

      _diamondInputs = j.diamondItems.map((d) {
        return DiamondItemInputData(
          id: d.id,
          weightCtrl: TextEditingController(text: d.weightCt > 0 ? d.weightCt.toString() : ''),
          sizeMm: d.sizeMm,
          shape: d.shape,
          customShapeCtrl: TextEditingController(text: d.customShape ?? ''),
        );
      }).toList();

      _gemstoneRows = j.gemstoneItems.map((g) {
        return {
          'weight': TextEditingController(text: g.weight > 0 ? g.weight.toString() : ''),
          'size': TextEditingController(text: g.size),
        };
      }).toList();

      _notesCtrl.text = j.notes ?? '';
      if (j.photos.isNotEmpty) {
        _photosBase64.addAll(j.photos);
      } else if (j.photoUrl != null && j.photoUrl!.isNotEmpty) {
        _photosBase64.add(j.photoUrl!);
      }
    } else {
      _jobNumber = widget.nextJobNumber;
      final now = DateTime.now();
      _dateTime = "${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}, ${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}";

      if (widget.manufacturers.isNotEmpty) {
        _manufacturerId = widget.manufacturers.first.id.toString();
      }

      _goldPurity = '24K'; // Always start with 24K
      _diamondInputs = []; // No pre-filled diamond rows by default
      _gemstoneRows = [];  // No pre-filled gemstone rows by default
    }
  }

  @override
  void dispose() {
    _productNameCtrl.dispose();
    _goldWeightCtrl.dispose();
    _notesCtrl.dispose();
    for (var d in _diamondInputs) {
      d.dispose();
    }
    for (var g in _gemstoneRows) {
      g['weight']?.dispose();
      g['size']?.dispose();
    }
    super.dispose();
  }

  void _addDiamondRow() {
    setState(() {
      _diamondInputs.add(
        DiamondItemInputData(
          id: 'd-${DateTime.now().millisecondsSinceEpoch}-${_diamondInputs.length}',
          weightCtrl: TextEditingController(),
          sizeMm: null, // Blank / Unselected
          shape: null,  // Blank / Unselected
          customShapeCtrl: TextEditingController(),
        ),
      );
      _stockErrorMessage = null;
      _validationErrorMessage = null;
    });
  }

  void _removeDiamondRow(int index) {
    setState(() {
      final removed = _diamondInputs.removeAt(index);
      removed.dispose();
      _stockErrorMessage = null;
      _validationErrorMessage = null;
    });
  }

  void _addGemstoneRow() {
    setState(() {
      _gemstoneRows.add({
        'weight': TextEditingController(),
        'size': TextEditingController(),
      });
      _validationErrorMessage = null;
    });
  }

  void _removeGemstoneRow(int index) {
    setState(() {
      final removed = _gemstoneRows.removeAt(index);
      removed['weight']?.dispose();
      removed['size']?.dispose();
      _validationErrorMessage = null;
    });
  }

  Future<void> _pickPhoto(ImageSource source) async {
    try {
      if (source == ImageSource.gallery) {
        final List<XFile> pickedFiles = await _picker.pickMultiImage(
          maxWidth: 1024,
          maxHeight: 1024,
          imageQuality: 80,
        );
        if (pickedFiles.isNotEmpty) {
          final maxAllowed = 3 - _photosBase64.length;
          for (var i = 0; i < pickedFiles.length && i < maxAllowed; i++) {
            final bytes = await pickedFiles[i].readAsBytes();
            final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
            setState(() {
              _photosBase64.add(base64String);
            });
          }
        }
      } else {
        final XFile? photo = await _picker.pickImage(
          source: ImageSource.camera,
          maxWidth: 1024,
          maxHeight: 1024,
          imageQuality: 80,
        );
        if (photo != null && _photosBase64.length < 3) {
          final bytes = await photo.readAsBytes();
          final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
          setState(() {
            _photosBase64.add(base64String);
          });
        }
      }
    } catch (e) {
      debugPrint('Error picking photo: $e');
    }
  }

  void _showPhotoOptionsSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Attach Reference Photos (Max 3)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppTheme.goldPrimary,
                    ),
                    icon: const Icon(Icons.camera_alt, color: Colors.white),
                    label: const Text('Take Photo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _pickPhoto(ImageSource.camera);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: AppTheme.goldPrimary),
                    ),
                    icon: const Icon(Icons.photo_library, color: AppTheme.goldPrimary),
                    label: const Text('Choose Gallery', style: TextStyle(color: AppTheme.goldPrimary, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _pickPhoto(ImageSource.gallery);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _saveJob() {
    setState(() {
      _stockErrorMessage = null;
      _validationErrorMessage = null;
    });

    if (_formKey.currentState!.validate()) {
      final appState = Provider.of<AppState>(context, listen: false);
      final isEditing = widget.initialJob != null;
      final parentJobId = isEditing ? widget.initialJob!.id : 'job-${DateTime.now().millisecondsSinceEpoch}';

      // 1. Validate Diamond Inputs only if diamond rows were added
      for (int i = 0; i < _diamondInputs.length; i++) {
        final d = _diamondInputs[i];
        final w = double.tryParse(d.weightCtrl.text) ?? 0.0;
        if (w <= 0) {
          setState(() => _validationErrorMessage = 'Please enter weight for Diamond #${i + 1}');
          return;
        }
        if (d.sizeMm == null) {
          setState(() => _validationErrorMessage = 'Please select size (mm) for Diamond #${i + 1}');
          return;
        }
        if (d.shape == null) {
          setState(() => _validationErrorMessage = 'Please select shape for Diamond #${i + 1}');
          return;
        }
        if (d.shape == 'Other' && d.customShapeCtrl.text.trim().isEmpty) {
          setState(() => _validationErrorMessage = 'Please specify custom shape for Diamond #${i + 1}');
          return;
        }
      }

      // Build structured diamond items
      final dItems = _diamondInputs.map((d) {
        return DiamondItem(
          id: d.id,
          parentId: parentJobId,
          weightCt: double.tryParse(d.weightCtrl.text) ?? 0.0,
          sizeMm: d.sizeMm ?? 2.5,
          shape: d.shape ?? 'Round',
          customShape: d.shape == 'Other' ? d.customShapeCtrl.text.trim() : null,
        );
      }).toList();

      // Validate diamond stock only if diamonds were actually issued
      if (dItems.isNotEmpty) {
        final stockErr = appState.validateJobDiamondStock(dItems);
        if (stockErr != null) {
          setState(() {
            _stockErrorMessage = stockErr;
          });
          return;
        }
      }

      // Build gemstone items
      final gItems = _gemstoneRows
          .where((r) => r['weight']!.text.isNotEmpty || r['size']!.text.isNotEmpty)
          .map((r) => GemstoneItem(
                id: 'g-item-${DateTime.now().microsecondsSinceEpoch}',
                parentId: parentJobId,
                weight: double.tryParse(r['weight']!.text) ?? 0.0,
                size: r['size']!.text.isEmpty ? 'Standard' : r['size']!.text,
                stoneType: 'Gemstone',
              ))
          .toList();

      // Lookup manufacturer name safely
      String mfgName = 'Artisan Workshop';
      for (final m in widget.manufacturers) {
        if (m.id.toString() == _manufacturerId) {
          mfgName = m.name.toString();
          break;
        }
      }

      final job = JobEntry(
        id: parentJobId,
        jobNumber: _jobNumber,
        timestamp: _dateTime,
        manufacturerId: _manufacturerId,
        manufacturerName: mfgName,
        productName: _productNameCtrl.text.isEmpty ? 'Custom Jewellery Order' : _productNameCtrl.text,
        goldWeight: double.tryParse(_goldWeightCtrl.text) ?? 0.0,
        goldPurity: _goldPurity,
        status: isEditing ? widget.initialJob!.status : 'In Progress',
        notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
        photoUrl: _photosBase64.isNotEmpty ? _photosBase64.first : null,
        photos: _photosBase64,
        diamondItems: dItems,
        gemstoneItems: gItems,
      );

      // Auto-generate linked Material OUT transaction and update stock
      appState.recordJobDiamondOutward(job);

      widget.onSubmit(job);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.initialJob != null;
    final appState = Provider.of<AppState>(context);

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
                
                // Modal Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(999)),
                          child: Text(isEditing ? 'EDIT JOB' : 'NEW MANUFACTURING JOB', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ),
                        const SizedBox(height: 4),
                        Text(isEditing ? 'Edit Job #$_jobNumber' : 'Create Job #$_jobNumber', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 14),

                // Validation Error Alert
                if (_validationErrorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_validationErrorMessage!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFB91C1C))),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Insufficient Stock Alert Banner
                if (_stockErrorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 22),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('INSUFFICIENT DIAMOND STOCK', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF991B1B))),
                              const SizedBox(height: 2),
                              Text(_stockErrorMessage!, style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C), height: 1.3)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // LOCKED FIELD 1 & 2: JOB NUMBER & TIMESTAMP
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('JOB NUMBER (AUTO)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFCBD5E1))),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('#$_jobNumber', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF2563EB))),
                                const Icon(Icons.lock, size: 14, color: Color(0xFF94A3B8)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DATE & TIME', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFCBD5E1))),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(child: Text(_dateTime, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Color(0xFF475569)), overflow: TextOverflow.ellipsis)),
                                const Icon(Icons.lock, size: 14, color: Color(0xFF94A3B8)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // KARIGAR & PRODUCT NAME
                if (!isEditing) ...[
                  DropdownButtonFormField<String>(
                    value: _manufacturerId.isNotEmpty ? _manufacturerId : null,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'ASSIGNED KARIGAR / MANUFACTURER *'),
                    items: widget.manufacturers.map((m) {
                      return DropdownMenuItem<String>(
                        value: m.id.toString(),
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 300),
                          child: Text('${m.name} (${m.office})', overflow: TextOverflow.ellipsis),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _manufacturerId = val);
                    },
                    validator: (val) => val == null || val.isEmpty ? 'Karigar is required' : null,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _productNameCtrl,
                    decoration: const InputDecoration(labelText: 'PRODUCT NAME / ITEM TYPE *', hintText: 'e.g. 14K Diamond Solitaire Snake Ring'),
                    validator: (val) => val == null || val.isEmpty ? 'Product name is required' : null,
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('PRODUCT & KARIGAR (LOCKED)', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(_productNameCtrl.text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // 1. GOLD SECTION (OPTIONAL) - ALWAYS STARTS WITH 24K
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
                      const Text('GOLD ISSUED (OPTIONAL)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: TextFormField(
                              controller: _goldWeightCtrl,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: const InputDecoration(labelText: 'Weight (g)', hintText: '0.000 g'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            flex: 2,
                            child: DropdownButtonFormField<String>(
                              value: _goldPurity,
                              isExpanded: true,
                              decoration: const InputDecoration(labelText: 'Purity'),
                              items: _goldPurityOptions.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _goldPurity = val);
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 2. STRUCTURED DIAMOND SECTION (CLEAN ZERO-ROW START)
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
                            'DIAMOND ISSUED (${_diamondInputs.length} ROWS)',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                          ),
                          if (_diamondInputs.isNotEmpty)
                            Text(
                              'Total: ${_diamondInputs.fold(0.0, (s, d) => s + (double.tryParse(d.weightCtrl.text) ?? 0.0)).toStringAsFixed(2)} ct',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      if (_diamondInputs.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: Column(
                            children: [
                              const Text('No diamonds added to this job yet.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                              const SizedBox(height: 8),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFEFF6FF),
                                  foregroundColor: const Color(0xFF2563EB),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Color(0xFF93C5FD))),
                                ),
                                icon: const Icon(Icons.add, size: 14),
                                label: const Text('+ Add Diamond Item', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                onPressed: _addDiamondRow,
                              ),
                            ],
                          ),
                        )
                      else ...[
                        for (int idx = 0; idx < _diamondInputs.length; idx++)
                          Builder(
                            builder: (context) {
                              final d = _diamondInputs[idx];
                              final avail = (d.sizeMm != null && d.shape != null)
                                  ? appState.getAvailableDiamondStock(d.sizeMm!, d.shape!, d.customShapeCtrl.text)
                                  : null;
                              return DiamondItemInput(
                                index: idx,
                                data: d,
                                availableStock: avail,
                                showRemove: true,
                                onRemove: () => _removeDiamondRow(idx),
                                onWeightChanged: (_) => setState(() => _stockErrorMessage = null),
                                onSizeChanged: (_) => setState(() => _stockErrorMessage = null),
                                onShapeChanged: (_) => setState(() => _stockErrorMessage = null),
                              );
                            },
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
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 3. GEMSTONE SECTION (CLEAN ZERO-ROW START)
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
                      Text(
                        'GEMSTONE ISSUED (${_gemstoneRows.length} ROWS)',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8)),
                      ),
                      const SizedBox(height: 8),

                      if (_gemstoneRows.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE9D5FF)),
                          ),
                          child: Column(
                            children: [
                              const Text('No gemstones added to this job yet.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                              const SizedBox(height: 8),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFAF5FF),
                                  foregroundColor: const Color(0xFF9333EA),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Color(0xFFD8B4FE))),
                                ),
                                icon: const Icon(Icons.add, size: 14),
                                label: const Text('+ Add Gemstone Item', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                onPressed: _addGemstoneRow,
                              ),
                            ],
                          ),
                        )
                      else ...[
                        for (int idx = 0; idx < _gemstoneRows.length; idx++)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _gemstoneRows[idx]['weight'],
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    decoration: const InputDecoration(labelText: 'Weight (ct)', hintText: '0.00 ct'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextFormField(
                                    controller: _gemstoneRows[idx]['size'],
                                    decoration: const InputDecoration(labelText: 'Size', hintText: 'e.g. 5x7 mm'),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                InkWell(
                                  onTap: () => _removeGemstoneRow(idx),
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
                                    child: const Icon(Icons.close, size: 16, color: Color(0xFFDC2626)),
                                  ),
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
                          label: const Text('+ Add More Gemstone Size', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF9333EA))),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 4. PHOTO ATTACHMENTS (UP TO 3 PHOTOS)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PHOTO ATTACHMENTS (${_photosBase64.length}/3)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    if (_photosBase64.length < 3)
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          side: const BorderSide(color: Color(0xFF93C5FD)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        icon: const Icon(Icons.add, size: 13, color: Color(0xFF2563EB)),
                        label: const Text('+ Add Photos', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        onPressed: _showPhotoOptionsSheet,
                      ),
                  ],
                ),

                if (_photosBase64.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _photosBase64.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final base64Img = entry.value;
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              base64Decode(base64Img.split(',').last),
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -4,
                            right: -4,
                            child: InkWell(
                              onTap: () => setState(() => _photosBase64.removeAt(idx)),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(color: Color(0xFFDC2626), shape: BoxShape.circle),
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

                // 5. NOTES (OPTIONAL)
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'NOTES (OPTIONAL)', hintText: 'Special setting instructions, hallmark requirements...'),
                ),

                const SizedBox(height: 16),

                // SUBMIT BUTTON
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    onPressed: _saveJob,
                    child: Text(
                      isEditing ? 'SAVE CHANGES' : 'CREATE JOB',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
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
