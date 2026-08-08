import 'package:flutter/material.dart';

class DiamondItemInputData {
  String id;
  TextEditingController weightCtrl;
  double? sizeMm;
  String? shape;
  TextEditingController customShapeCtrl;

  DiamondItemInputData({
    required this.id,
    required this.weightCtrl,
    this.sizeMm,
    this.shape,
    required this.customShapeCtrl,
  });

  void dispose() {
    weightCtrl.dispose();
    customShapeCtrl.dispose();
  }
}

class DiamondItemInput extends StatelessWidget {
  final int index;
  final DiamondItemInputData data;
  final VoidCallback onRemove;
  final bool showRemove;
  final double? availableStock;
  final ValueChanged<double>? onWeightChanged;
  final ValueChanged<double?>? onSizeChanged;
  final ValueChanged<String?>? onShapeChanged;

  const DiamondItemInput({
    super.key,
    required this.index,
    required this.data,
    required this.onRemove,
    this.showRemove = true,
    this.availableStock,
    this.onWeightChanged,
    this.onSizeChanged,
    this.onShapeChanged,
  });

  // Programmatically generate sizes from 0.8 mm to 11.0 mm in 0.1 mm increments
  static final List<double> standardSizes = List.generate(
    103,
    (i) => double.parse((0.8 + (i * 0.1)).toStringAsFixed(1)),
  );

  static final List<String> standardShapes = [
    'Round',
    'Princess',
    'Cushion',
    'Oval',
    'Pear',
    'Marquise',
    'Emerald',
    'Radiant',
    'Asscher',
    'Heart',
    'Baguette',
    'Uncut',
    'Other',
  ];

  @override
  Widget build(BuildContext context) {
    final isCustomShape = data.shape == 'Other';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBFDBFE)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row Header: Item # and Remove Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF93C5FD)),
                    ),
                    child: Text(
                      'DIAMOND #${index + 1}',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                    ),
                  ),
                  if (availableStock != null && data.sizeMm != null && data.shape != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: (availableStock! > 0) ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: (availableStock! > 0) ? const Color(0xFF86EFAC) : const Color(0xFFFCA5A5),
                        ),
                      ),
                      child: Text(
                        'Stock: ${availableStock!.toStringAsFixed(2)} ct',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: (availableStock! > 0) ? const Color(0xFF15803D) : const Color(0xFFDC2626),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              if (showRemove)
                InkWell(
                  onTap: onRemove,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.close, size: 14, color: Color(0xFFDC2626)),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 10),

          // Primary Inputs: Weight (ct) | Size (mm) | Shape (No forced pre-filled defaults)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Weight (Carats)
              Expanded(
                flex: 3,
                child: TextFormField(
                  controller: data.weightCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Weight (ct) *',
                    hintText: 'e.g. 0.25',
                    suffixText: 'ct',
                    isDense: true,
                  ),
                  onChanged: (val) {
                    final w = double.tryParse(val) ?? 0.0;
                    if (onWeightChanged != null) onWeightChanged!(w);
                  },
                ),
              ),

              const SizedBox(width: 8),

              // 2. Programmatic Size (0.8 mm - 11.0 mm) with unselected placeholder
              Expanded(
                flex: 3,
                child: DropdownButtonFormField<double>(
                  value: data.sizeMm,
                  isExpanded: true,
                  hint: const Text('-- Size --', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  decoration: const InputDecoration(
                    labelText: 'Size (mm) *',
                    isDense: true,
                  ),
                  items: standardSizes.map((s) {
                    return DropdownMenuItem<double>(
                      value: s,
                      child: Text('${s.toStringAsFixed(1)} mm', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    );
                  }).toList(),
                  onChanged: (newSize) {
                    data.sizeMm = newSize;
                    if (onSizeChanged != null) onSizeChanged!(newSize);
                  },
                ),
              ),

              const SizedBox(width: 8),

              // 3. Shape Dropdown with unselected placeholder
              Expanded(
                flex: 3,
                child: DropdownButtonFormField<String>(
                  value: data.shape,
                  isExpanded: true,
                  hint: const Text('-- Shape --', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  decoration: const InputDecoration(
                    labelText: 'Shape *',
                    isDense: true,
                  ),
                  items: standardShapes.map((sh) {
                    return DropdownMenuItem<String>(
                      value: sh,
                      child: Text(sh, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    );
                  }).toList(),
                  onChanged: (newShape) {
                    data.shape = newShape;
                    if (onShapeChanged != null) onShapeChanged!(newShape);
                  },
                ),
              ),
            ],
          ),

          // 4. Custom Shape Input (Only if 'Other' is selected)
          if (isCustomShape) ...[
            const SizedBox(height: 8),
            TextFormField(
              controller: data.customShapeCtrl,
              decoration: const InputDecoration(
                labelText: 'Specify Shape *',
                hintText: 'e.g. Trilliant / Shield / Kite Cut',
                isDense: true,
              ),
              onChanged: (val) {
                if (onShapeChanged != null) onShapeChanged!(val);
              },
            ),
          ],
        ],
      ),
    );
  }
}
