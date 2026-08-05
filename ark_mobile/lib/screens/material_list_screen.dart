import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';
import '../widgets/material_modal.dart';

class MaterialListScreen extends StatefulWidget {
  final String initialDirection;

  const MaterialListScreen({super.key, this.initialDirection = 'INWARD'});

  @override
  State<MaterialListScreen> createState() => _MaterialListScreenState();
}

class _MaterialListScreenState extends State<MaterialListScreen> {
  late String _selectedCategory; // 'gold', 'diamond', 'gemstone'
  late String _filterDirection;   // 'ALL', 'INWARD', 'OUTWARD'

  String? _filterVendor;
  String? _filterPurity;

  @override
  void initState() {
    super.initState();
    _selectedCategory = 'gold';
    _filterDirection = 'ALL';
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    // Filter materials by active category
    final categoryMaterials = appState.materials.where((m) {
      final matType = m.materialType.toLowerCase();
      return matType == _selectedCategory;
    }).toList();

    // Summary calculations
    final totalIn = categoryMaterials
        .where((m) => m.direction == 'INWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    final totalOut = categoryMaterials
        .where((m) => m.direction == 'OUTWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    final balance = totalIn - totalOut;
    final unitLabel = _selectedCategory == 'gold' ? 'g' : 'CTS';

    // Advanced filtering
    final filteredTransactions = categoryMaterials.where((m) {
      if (_filterDirection == 'INWARD' && m.direction != 'INWARD') return false;
      if (_filterDirection == 'OUTWARD' && m.direction != 'OUTWARD') return false;
      if (_filterVendor != null && !m.vendorName.toLowerCase().contains(_filterVendor!.toLowerCase())) {
        return false;
      }
      if (_filterPurity != null && m.purity != _filterPurity) return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('${_selectedCategory.toUpperCase()} Vault List', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
            
            // 1. Material Category Segmented Tabs (Gold, Diamond, Gemstone)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
              child: Row(
                children: ['gold', 'diamond', 'gemstone'].map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedCategory = cat;
                          _filterDirection = 'ALL';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
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

            const SizedBox(height: 16),

            // 2. Vault Summary Card (In = Green, Out = RED, Balance = BLUE)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.borderSubtle),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${_selectedCategory.toUpperCase()} VAULT SUMMARY', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10)),
                        child: const Text('LIVE BALANCE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      // Total IN (Green)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filterDirection = 'INWARD'),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _filterDirection == 'INWARD' ? const Color(0xFF059669) : const Color(0xFFA7F3D0),
                                width: _filterDirection == 'INWARD' ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                const Text('TOTAL IN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                                const SizedBox(height: 2),
                                Text('${totalIn.toStringAsFixed(3)} $unitLabel', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Total OUT (RED)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filterDirection = 'OUTWARD'),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _filterDirection == 'OUTWARD' ? const Color(0xFFDC2626) : const Color(0xFFFCA5A5),
                                width: _filterDirection == 'OUTWARD' ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                const Text('TOTAL OUT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                                const SizedBox(height: 2),
                                Text('${totalOut.toStringAsFixed(3)} $unitLabel', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF991B1B))),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Remaining (BLUE)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filterDirection = 'ALL'),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _filterDirection == 'ALL' ? const Color(0xFF2563EB) : const Color(0xFFBFDBFE),
                                width: _filterDirection == 'ALL' ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                const Text('REMAINING', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                const SizedBox(height: 2),
                                Text('${balance.toStringAsFixed(3)} $unitLabel', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
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

            const SizedBox(height: 16),

            // 3. PROMINENT SINGLE "+ Add New Entry" BUTTON
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => MaterialModal(
                      initialDirection: 'INWARD',
                      initialCategory: _selectedCategory,
                      manufacturers: appState.manufacturers,
                      onSubmit: (entry) => appState.addMaterial(entry),
                    ),
                  );
                },
                icon: const Icon(Icons.add, color: Colors.white),
                label: const Text('+ Add New Entry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),

            const SizedBox(height: 16),

            // 4. Transaction List Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${_selectedCategory.toUpperCase()} Transactions (${filteredTransactions.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
              ],
            ),
            const SizedBox(height: 10),

            filteredTransactions.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(24),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Text('No $_selectedCategory entries match filters.', style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredTransactions.length,
                    itemBuilder: (context, index) {
                      final entry = filteredTransactions[index];
                      final isInward = entry.direction == 'INWARD';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppTheme.borderSubtle)),
                        child: ListTile(
                          onTap: () => _showEntryDetailDialog(context, entry, unitLabel),
                          leading: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isInward ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isInward ? const Color(0xFF059669) : const Color(0xFFDC2626),
                            ),
                          ),
                          title: Text('${entry.weight} $unitLabel ${entry.purity != null ? "(${entry.purity})" : ""}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text('${entry.vendorName} • ${entry.timestamp}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('₹${entry.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                              const Text('Tap details ➔', style: TextStyle(fontSize: 10, color: AppTheme.goldDark, fontWeight: FontWeight.bold)),
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

  void _showEntryDetailDialog(BuildContext context, MaterialEntry entry, String unitLabel) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 420),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: entry.direction == 'INWARD' ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${entry.direction} ENTRY',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: entry.direction == 'INWARD' ? const Color(0xFF059669) : const Color(0xFFDC2626),
                      ),
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.bgPrimary,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSubtle),
                ),
                child: Column(
                  children: [
                    _buildDetailRow('Timestamp', entry.timestamp),
                    _buildDetailRow('Material', entry.materialType.toUpperCase()),
                    _buildDetailRow('Weight', '${entry.weight} $unitLabel'),
                    if (entry.purity != null) _buildDetailRow('Purity Standard', entry.purity!),
                    _buildDetailRow(entry.direction == 'INWARD' ? 'Vendor' : 'Karigar', entry.vendorName),
                    const Divider(height: 16),
                    _buildDetailRow('Total Amount', '₹${entry.totalAmount.toStringAsFixed(0)}', isBold: true),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.textMain, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('CLOSE DETAILS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: AppTheme.textMain)),
        ],
      ),
    );
  }
}
