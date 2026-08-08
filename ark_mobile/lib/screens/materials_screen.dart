import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/material_modal.dart';

class MaterialsScreen extends StatefulWidget {
  const MaterialsScreen({super.key});

  @override
  State<MaterialsScreen> createState() => _MaterialsScreenState();
}

class _MaterialsScreenState extends State<MaterialsScreen> {
  String selectedCat = 'gold';

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    final filteredList = appState.materials.where((m) {
      return m.materialType.toLowerCase() == selectedCat.toLowerCase();
    }).toList();

    double totalIn = filteredList
        .where((m) => m.direction == 'INWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    double totalOut = filteredList
        .where((m) => m.direction == 'OUTWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    double remaining = totalIn - totalOut;

    final isDiamond = selectedCat == 'diamond';
    final diamondGroupedStock = isDiamond ? appState.getGroupedDiamondStock() : null;

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Material Vault & Balances', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textMain),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category Segment Tabs
            Row(
              children: ['gold', 'diamond', 'gemstone'].map((cat) {
                final isSelected = selectedCat == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(cat.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: isSelected ? Colors.white : AppTheme.textMuted)),
                    selected: isSelected,
                    selectedColor: AppTheme.goldDark,
                    onSelected: (val) => setState(() => selectedCat = cat),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Live Vault Balance Cards
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildVaultCard('TOTAL INWARD', '${totalIn.toStringAsFixed(2)} ${isDiamond ? "ct" : "g"}', 'Store Intake', AppTheme.inwardGreen),
                  const SizedBox(width: 10),
                  _buildVaultCard('TOTAL OUTWARD', '${totalOut.toStringAsFixed(2)} ${isDiamond ? "ct" : "g"}', 'Issued Karigars', AppTheme.outwardRose),
                  const SizedBox(width: 10),
                  _buildVaultCard('NET REMAINING', '${remaining.toStringAsFixed(2)} ${isDiamond ? "ct" : "g"}', 'Vault Balance', AppTheme.goldPrimary),
                ],
              ),
            ),

            // STRUCTURED DIAMOND INVENTORY GROUPED BY SIZE & SHAPE
            if (isDiamond && diamondGroupedStock != null && diamondGroupedStock.isNotEmpty) ...[
              const SizedBox(height: 22),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Diamond Stock by Size & Shape', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(999), border: Border.all(color: const Color(0xFFBFDBFE))),
                    child: Text('${diamondGroupedStock.length} Size Groups', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: diamondGroupedStock.length,
                itemBuilder: (context, index) {
                  final sizeKey = diamondGroupedStock.keys.elementAt(index);
                  final shapes = diamondGroupedStock[sizeKey]!;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 2))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFBFDBFE))),
                              child: Text(sizeKey, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF1E40AF))),
                            ),
                            Text(
                              'Available: ${shapes.fold(0.0, (s, info) => s + info.available).toStringAsFixed(2)} ct',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Shapes Breakdown Grid
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: shapes.map((info) {
                            final isAvail = info.available > 0;
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: isAvail ? const Color(0xFFF8FAFC) : const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: isAvail ? const Color(0xFFCBD5E1) : const Color(0xFFFCA5A5)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(info.shape, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                                  const SizedBox(height: 2),
                                  Text('Avail: ${info.available.toStringAsFixed(2)} ct', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isAvail ? const Color(0xFF047857) : const Color(0xFFDC2626))),
                                  Text('Rec: ${info.totalReceived.toStringAsFixed(2)} | Iss: ${info.totalIssued.toStringAsFixed(2)}', style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],

            const SizedBox(height: 20),

            // Transaction Header & Add Entry Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Material History', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.goldPrimary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('+ Add New Entry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => MaterialModal(
                        initialDirection: 'INWARD',
                        initialCategory: selectedCat,
                        manufacturers: appState.manufacturers,
                        onSubmit: (entry) => appState.addMaterialEntry(entry),
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Material Transaction List
            filteredList.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(28),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: const Text('No transactions recorded yet.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredList.length,
                    itemBuilder: (context, index) {
                      final m = filteredList[index];
                      final isInward = m.direction == 'INWARD';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFFE2E8F0))),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isInward ? const Color(0x2610B981) : const Color(0x26F43F5E),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  isInward ? Icons.arrow_downward : Icons.arrow_upward,
                                  color: isInward ? AppTheme.inwardGreen : AppTheme.outwardRose,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          '${m.weight.toStringAsFixed(2)} ${m.materialType == 'gold' ? 'g' : 'ct'} (${m.direction})',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain),
                                        ),
                                        Text(
                                          '₹ ${m.totalAmount.toStringAsFixed(0)}',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.inwardGreen),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${m.vendorName} • ${m.timestamp}',
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                    ),

                                    // Diamond Items Chips
                                    if (m.diamondItems.isNotEmpty) ...[
                                      const SizedBox(height: 6),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 4,
                                        children: m.diamondItems.map((d) => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4), border: Border.all(color: const Color(0xFFBFDBFE))),
                                          child: Text('${d.weightCt.toStringAsFixed(2)} ct (${d.sizeDisplay} ${d.effectiveShape})', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                                        )).toList(),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
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

  Widget _buildVaultCard(String title, String mainValue, String subValue, Color color) {
    return Container(
      width: 170,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
          const SizedBox(height: 4),
          Text(mainValue, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 4),
          Text(subValue, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}
