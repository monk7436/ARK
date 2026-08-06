import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class JobModal extends StatefulWidget {
  final Map<String, dynamic>? initialJob;
  final List<dynamic> manufacturers;
  final String nextJobNumber;
  final Function(Map<String, dynamic>) onSubmit;

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
  late bool isEditing;
  late String _jobNumber;
  late String _dateTime;
  
  String? _selectedManufacturerId;
  final _productNameCtrl = TextEditingController();
  final _goldWeightCtrl = TextEditingController();
  String _goldPurity = '22K';
  final _notesCtrl = TextEditingController();

  // Multi-row Diamond items
  List<Map<String, TextEditingController>> _diamondRows = [];
  // Multi-row Gemstone items
  List<Map<String, TextEditingController>> _gemstoneRows = [];

  final List<String> _goldPurityOptions = ['24K', '22K', '18K', '14K', '9K'];

  @override
  void initState() {
    super.initState();
    isEditing = widget.initialJob != null;

    if (isEditing) {
      final j = widget.initialJob!;
      _jobNumber = j['jobNumber'] ?? '001';
      _dateTime = j['timestamp'] ?? '';
      _selectedManufacturerId = j['manufacturerId'];
      _productNameCtrl.text = j['productName'] ?? '';
      _goldWeightCtrl.text = j['goldWeight']?.toString() ?? '';
      _goldPurity = j['goldPurity'] ?? '22K';
      _notesCtrl.text = j['notes'] ?? '';

      final dList = j['diamondRows'] as List<dynamic>? ?? [];
      if (dList.isNotEmpty) {
        _diamondRows = dList.map((d) => {
          'weight': TextEditingController(text: d['weight']?.toString() ?? ''),
          'size': TextEditingController(text: d['size']?.toString() ?? ''),
        }).toList();
      } else {
        _diamondRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
      }

      final gList = j['gemstoneRows'] as List<dynamic>? ?? [];
      if (gList.isNotEmpty) {
        _gemstoneRows = gList.map((g) => {
          'weight': TextEditingController(text: g['weight']?.toString() ?? ''),
          'size': TextEditingController(text: g['size']?.toString() ?? ''),
        }).toList();
      } else {
        _gemstoneRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
      }

    } else {
      _jobNumber = widget.nextJobNumber;
      final now = DateTime.now();
      _dateTime = "${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}, ${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}";
      if (widget.manufacturers.isNotEmpty) {
        _selectedManufacturerId = widget.manufacturers.first.id;
      }
      _diamondRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
      _gemstoneRows = [{'weight': TextEditingController(), 'size': TextEditingController()}];
    }
  }

  void _addDiamondRow() {
    setState(() {
      _diamondRows.add({'weight': TextEditingController(), 'size': TextEditingController()});
    });
  }

  void _removeDiamondRow(int index) {
    if (_diamondRows.length > 1) {
      setState(() {
        _diamondRows.removeAt(index);
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
    _productNameCtrl.dispose();
    _goldWeightCtrl.dispose();
    _notesCtrl.dispose();
    for (var r in _diamondRows) {
      r['weight']?.dispose();
      r['size']?.dispose();
    }
    for (var r in _gemstoneRows) {
      r['weight']?.dispose();
      r['size']?.dispose();
    }
    super.dispose();
  }

  void _submit() {
    String mfgName = 'Artisan Workshop';
    if (_selectedManufacturerId != null) {
      final mfg = widget.manufacturers.firstWhere(
        (m) => m.id == _selectedManufacturerId,
        orElse: () => null,
      );
      if (mfg != null) mfgName = mfg.name;
    }

    final dData = _diamondRows
        .where((r) => r['weight']!.text.isNotEmpty || r['size']!.text.isNotEmpty)
        .map((r) => {'weight': r['weight']!.text, 'size': r['size']!.text})
        .toList();

    final gData = _gemstoneRows
        .where((r) => r['weight']!.text.isNotEmpty || r['size']!.text.isNotEmpty)
        .map((r) => {'weight': r['weight']!.text, 'size': r['size']!.text})
        .toList();

    final jobMap = {
      'id': isEditing ? widget.initialJob!['id'] : 'job-${DateTime.now().millisecondsSinceEpoch}',
      'jobNumber': _jobNumber,
      'timestamp': _dateTime,
      'manufacturerId': _selectedManufacturerId,
      'manufacturerName': mfgName,
      'productName': _productNameCtrl.text.isEmpty ? 'Custom Jewellery Order' : _productNameCtrl.text,
      'goldWeight': double.tryParse(_goldWeightCtrl.text) ?? 0.0,
      'goldPurity': _goldPurity,
      'diamondRows': dData,
      'gemstoneRows': gData,
      'notes': _notesCtrl.text,
      'status': isEditing ? widget.initialJob!['status'] : 'In Progress',
    };

    widget.onSubmit(jobMap);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 460),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(isEditing ? 'EDIT JOB' : 'NEW MANUFACTURING JOB', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                      Text(isEditing ? 'Edit Job #$_jobNumber' : 'Create Job #$_jobNumber', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                ],
              ),
              const SizedBox(height: 14),

              // LOCKED JOB NUMBER & TIMESTAMP
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.borderSubtle)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('JOB NUMBER (AUTO)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                          const SizedBox(height: 2),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('#$_jobNumber', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                              const Icon(Icons.lock, size: 14, color: AppTheme.textMuted),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.borderSubtle)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DATE & TIME', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                          const SizedBox(height: 2),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(child: Text(_dateTime, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.textMain), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              const Icon(Icons.lock, size: 14, color: AppTheme.textMuted),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              if (!isEditing) ...[
                DropdownButtonFormField<String>(
                  value: _selectedManufacturerId,
                  decoration: const InputDecoration(labelText: 'ASSIGNED KARIGAR'),
                  items: widget.manufacturers.map((m) {
                    return DropdownMenuItem<String>(value: m.id, child: Text('${m.name} (${m.office})'));
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedManufacturerId = val),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _productNameCtrl,
                  decoration: const InputDecoration(labelText: 'PRODUCT NAME / ITEM TYPE', hintText: 'e.g. 22K Antique Ring'),
                ),
              ],

              const SizedBox(height: 14),

              // 1. GOLD SECTION (OPTIONAL)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFFFFBE8), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFFEF08A))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('GOLD ISSUED (OPTIONAL)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _goldWeightCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(labelText: 'WEIGHT (g)', hintText: '0.000'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _goldPurity,
                            decoration: const InputDecoration(labelText: 'PURITY'),
                            items: _goldPurityOptions.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                            onChanged: (val) => setState(() => _goldPurity = val!),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 2. DIAMOND SECTION (MULTI-ROW WITH + ADD MORE)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFBFDBFE))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('DIAMOND ISSUED (${_diamondRows.length} ROWS)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                    const SizedBox(height: 8),

                    ..._diamondRows.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final row = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: row['weight'],
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'Weight (ct)', hintText: '0.00'),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextFormField(
                                controller: row['size'],
                                decoration: const InputDecoration(labelText: 'Size', hintText: '0.10 ct'),
                              ),
                            ),
                            if (_diamondRows.length > 1)
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
                                onPressed: () => _removeDiamondRow(idx),
                              ),
                          ],
                        ),
                      );
                    }).toList(),

                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 36)),
                      onPressed: _addDiamondRow,
                      icon: const Icon(Icons.add, size: 14, color: Color(0xFF2563EB)),
                      label: const Text('+ Add More Diamond Size', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 3. GEMSTONE SECTION (MULTI-ROW WITH + ADD MORE)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFFAF5FF), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE9D5FF))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('GEMSTONE ISSUED (${_gemstoneRows.length} ROWS)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8))),
                    const SizedBox(height: 8),

                    ..._gemstoneRows.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final row = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: row['weight'],
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'Weight (ct)', hintText: '0.00'),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextFormField(
                                controller: row['size'],
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
                      );
                    }).toList(),

                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 36)),
                      onPressed: _addGemstoneRow,
                      icon: const Icon(Icons.add, size: 14, color: Color(0xFF9333EA)),
                      label: const Text('+ Add More Gemstone Size', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF9333EA))),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // NOTES
              TextFormField(
                controller: _notesCtrl,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'NOTES (OPTIONAL)', hintText: 'Gold colour, customer requests...'),
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
    );
  }
}
