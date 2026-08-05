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

    double totalInGrams = filteredList
        .where((m) => m.direction == 'INWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    double totalOutGrams = filteredList
        .where((m) => m.direction == 'OUTWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    double remainingGrams = totalInGrams - totalOutGrams;

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
            // Category Tabs
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
                  _buildVaultCard('TOTAL INWARD', '${totalInGrams.toStringAsFixed(3)} g', 'Store Intake', AppTheme.inwardGreen),
                  const SizedBox(width: 10),
                  _buildVaultCard('TOTAL OUTWARD', '${totalOutGrams.toStringAsFixed(3)} g', 'Issued Karigars', AppTheme.outwardRose),
                  const SizedBox(width: 10),
                  _buildVaultCard('NET REMAINING', '${remainingGrams.toStringAsFixed(3)} g', 'Vault Balance', AppTheme.goldPrimary),
                ],
              ),
            ),

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
