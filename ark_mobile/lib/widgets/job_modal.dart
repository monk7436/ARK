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

  // 1. Gold Section (Always starts with 24K)
  final _goldWeightCtrl = TextEditingController();
  String _goldPurity = '24K';

  // 2. Structured Diamond Section
  List<DiamondItemInputData> _diamondInputs = [];

  // 3. Gemstone Section (Multi-row)
  List<Map<String, TextEditingController>> _gemstoneRows = [];

  // 4. Photo Attachments
  final List<String> _photosBase64 = [];
  final ImagePicker _picker = ImagePicker();

  // 5. Notes
  final _notesCtrl = TextEditingController();

  // Shortfall error message if stock insufficient
  String? _stockErrorMessage;

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
      if (_diamondInputs.isEmpty) {
        _diamondInputs.add(
          DiamondItemInputData(
            id: 'd-1',
            weightCtrl: TextEditingController(),
            sizeMm: 2.5,
            shape: 'Round',
            customShapeCtrl: TextEditingController(),
          ),
        );
      }

      _gemstoneRows = j.gemstoneItems.map((g) {
        return {
          'weight': TextEditingController(text: g.weight > 0 ? g.weight.toString() : ''),
          'size': TextEditingController(text: g.size),
        };
      }).toList();
      if (_gemstoneRows.isEmpty) {
        _gemstoneRows.add({'weight': TextEditingController(), 'size': TextEditingController()});
      }

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

      _diamondInputs = [
        DiamondItemInputData(
          id: 'd-1',
          weightCtrl: TextEditingController(),
          sizeMm: 2.5,
          shape: 'Round',
          customShapeCtrl: TextEditingController(),
        )
      ];

      _gemstoneRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
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
    for (var r in _gemstoneRows) {
      r['weight']?.dispose();
      r['size']?.dispose();
    }
    super.dispose();
  }

  void _addDiamondRow() {
    setState(() {
      _diamondInputs.add(
        DiamondItemInputData(
          id: 'd-${DateTime.now().millisecondsSinceEpoch}',
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

  void _showPhotoAttachmentSheet() {
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
                const Text('Attach Photo to Job', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
                          Icon(Icons.camera_alt_outlined, color: Color(0xFF2563EB), size: 28),
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
                          Icon(Icons.photo_library_outlined, color: Color(0xFF9333EA), size: 28),
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
      final appState = Provider.of<AppState>(context, listen: false);
      final isEditing = widget.initialJob != null;
      final parentJobId = isEditing ? widget.initialJob!.id : 'job-${DateTime.now().millisecondsSinceEpoch}';

      // 1. Build Structured Diamond Items
      final dItems = _diamondInputs
          .where((d) => (double.tryParse(d.weightCtrl.text) ?? 0.0) > 0)
          .map((d) => DiamondItem(
                id: d.id,
                parentId: parentJobId,
                weightCt: double.tryParse(d.weightCtrl.text) ?? 0.0,
                sizeMm: d.sizeMm,
                shape: d.shape,
                customShape: d.shape == 'Other' ? d.customShapeCtrl.text : null,
              ))
          .toList();

      // 2. Validate Diamond Stock Exact Match Rule
      final stockErr = appState.validateJobDiamondStock(dItems);
      if (stockErr != null) {
        setState(() {
          _stockErrorMessage = stockErr;
        });
        return;
      }

      // 3. Build Gemstone Items
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

                // 2. STRUCTURED DIAMOND SECTION (+ ADD MORE)
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
                      Text(
                        'DIAMOND ISSUED (${_diamondInputs.length} ROWS)',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                      ),
                      const SizedBox(height: 8),

                      for (int idx = 0; idx < _diamondInputs.length; idx++)
                        Builder(
                          builder: (context) {
                            final d = _diamondInputs[idx];
                            final avail = appState.getAvailableDiamondStock(d.sizeMm, d.shape, d.customShapeCtrl.text);
                            return DiamondItemInput(
                              index: idx,
                              data: d,
                              availableStock: avail,
                              showRemove: _diamondInputs.length > 1,
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
                  ),
                ),

                const SizedBox(height: 14),

                // 3. GEMSTONE SECTION (+ ADD MORE)
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
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextFormField(
                                  controller: _gemstoneRows[idx]['size'],
                                  decoration: const InputDecoration(labelText: 'Size', hintText: '5x7 mm Oval'),
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
                        label: const Text('+ Add More Gemstone Size', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF9333EA))),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 4. PHOTO ATTACHMENT SECTION
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PHOTO ATTACHMENTS (${_photosBase64.length}/3)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    InkWell(
                      onTap: _showPhotoAttachmentSheet,
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(999), border: Border.all(color: const Color(0xFFBFDBFE))),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, size: 14, color: Color(0xFF2563EB)),
                            SizedBox(width: 4),
                            Text('+ Add Photos', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
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
                            child: b64.startsWith('http')
                                ? Image.network(b64, width: 60, height: 60, fit: BoxFit.cover)
                                : Image.memory(base64Decode(b64.split(',').last), width: 60, height: 60, fit: BoxFit.cover),
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

                // 5. NOTES
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'NOTES (OPTIONAL)', hintText: 'Gold colour, customer requests, instructions...'),
                ),

                const SizedBox(height: 18),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _submit,
                    child: Text(isEditing ? 'SAVE JOB CHANGES' : 'CREATE JOB', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
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
