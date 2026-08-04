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
    final materials = appState.materials;

    // Calculate Balances
    double goldIn = materials.where((m) => m.materialType == 'gold' && m.direction == 'INWARD').fold(0, (a, b) => a + b.weight);
    double goldOut = materials.where((m) => m.materialType == 'gold' && m.direction == 'OUTWARD').fold(0, (a, b) => a + b.weight);
    double goldNet = goldIn - goldOut;

    double diamondIn = materials.where((m) => m.materialType == 'diamond' && m.direction == 'INWARD').fold(0, (a, b) => a + b.weight);
    double diamondOut = materials.where((m) => m.materialType == 'diamond' && m.direction == 'OUTWARD').fold(0, (a, b) => a + b.weight);
    double diamondNet = diamondIn - diamondOut;

    double gemstoneIn = materials.where((m) => m.materialType == 'gemstone' && m.direction == 'INWARD').fold(0, (a, b) => a + b.weight);
    double gemstoneOut = materials.where((m) => m.materialType == 'gemstone' && m.direction == 'OUTWARD').fold(0, (a, b) => a + b.weight);
    double gemstoneNet = gemstoneIn - gemstoneOut;

    final filteredList = materials.where((m) => m.materialType == selectedCat).toList();

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Stat Cards horizontal scroll
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildVaultCard('24K GOLD (995)', '${goldNet.toStringAsFixed(3)} g', 'In: +${goldIn.toStringAsFixed(1)} | Out: -${goldOut.toStringAsFixed(1)}', AppTheme.goldPrimary),
                  const SizedBox(width: 12),
                  _buildVaultCard('DIAMOND VAULT', '${diamondNet.toStringAsFixed(2)} CTS', 'In: +${diamondIn.toStringAsFixed(1)} | Out: -${diamondOut.toStringAsFixed(1)}', const Color(0xFF38BDF8)),
                  const SizedBox(width: 12),
                  _buildVaultCard('GEMSTONE VAULT', '${gemstoneNet.toStringAsFixed(2)} CTS', 'In: +${gemstoneIn.toStringAsFixed(1)} | Out: -${gemstoneOut.toStringAsFixed(1)}', const Color(0xFFA855F7)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Material Category Selector & Record Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: ['gold', 'diamond', 'gemstone'].map((cat) {
                    final isSel = selectedCat == cat;
                    return GestureDetector(
                      onTap: () => setState(() => selectedCat = cat),
                      child: Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSel ? AppTheme.goldPrimary : AppTheme.bgCard,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          cat.toUpperCase(),
                          style: TextStyle(
                            color: isSel ? Colors.black : AppTheme.textMuted,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.goldPrimary,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Record Entry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => MaterialModalBottomSheet(defaultCategory: selectedCat),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Material Transaction List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredList.length,
              itemBuilder: (context, index) {
                final m = filteredList[index];
                final isInward = m.direction == 'INWARD';
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
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
                                    '${m.weight} ${m.materialType == 'gold' ? 'g' : 'CTS'} (${m.direction})',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain),
                                  ),
                                  Text(
                                    '₹ ${m.totalAmount.toStringAsFixed(0)}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.inwardGreen),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${m.vendorName} • ${m.timestamp}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                              ),
                              if (m.productType != null) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.goldGlow,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    'Product: ${m.productType}',
                                    style: const TextStyle(fontSize: 10, color: AppTheme.goldPrimary, fontWeight: FontWeight.bold),
                                  ),
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
        color: AppTheme.bgCard,
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
          Text(subValue, style: const TextStyle(fontSize: 10, color: AppTheme.textDim)),
        ],
      ),
    );
  }
}
