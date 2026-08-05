import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/material_entry.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/material_modal.dart';

class MaterialListScreen extends StatefulWidget {
  final String initialDirection;
  const MaterialListScreen({super.key, this.initialDirection = 'INWARD'});

  @override
  State<MaterialListScreen> createState() => _MaterialListScreenState();
}

class _MaterialListScreenState extends State<MaterialListScreen> {
  String _selectedCategory = 'gold'; // 'gold', 'diamond', 'gemstone'
  String _filterDirection = 'ALL'; // 'ALL', 'INWARD', 'OUTWARD'
  
  // Advanced Filter state
  String _filterVendor = '';
  String _filterPurity = '';

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    // Filter materials by selected category
    final categoryMaterials = appState.materials.where((m) {
      return m.materialType.toLowerCase() == _selectedCategory;
    }).toList();

    // Summary calculations
    final double totalIn = categoryMaterials
        .where((m) => m.direction == 'INWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    final double totalOut = categoryMaterials
        .where((m) => m.direction == 'OUTWARD')
        .fold(0.0, (sum, m) => sum + m.weight);

    final double balance = totalIn - totalOut;
    final unitLabel = _selectedCategory == 'gold' ? 'g' : 'CTS';

    // Advanced Filtering Logic
    final filteredTransactions = categoryMaterials.where((m) {
      if (_filterDirection == 'INWARD' && m.direction != 'INWARD') return false;
      if (_filterDirection == 'OUTWARD' && m.direction != 'OUTWARD') return false;

      if (_filterVendor.isNotEmpty &&
          !m.vendorName.toLowerCase().contains(_filterVendor.toLowerCase())) {
        return false;
      }

      if (_filterPurity.isNotEmpty && m.purity != _filterPurity) {
        return false;
      }

      return true;
    }).toList();

    final hasActiveAdvancedFilters = _filterVendor.isNotEmpty || _filterPurity.isNotEmpty;

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Material Vault List', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
        backgroundColor: Colors.white,
        elevation: 1,
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
            
            // 1. Three Material Category Tabs (Gold, Diamond, Gemstone)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              padding: const EdgeInsets.all(4),
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
                          color: isSelected ? AppTheme.goldPrimary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            cat.toUpperCase(),
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppTheme.textMuted,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),

            // 2. Material Vault Summary Card (In = Green, OUT = RED, Remaining = BLUE)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_selectedCategory.toUpperCase()} VAULT SUMMARY',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.goldDark),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('LIVE BALANCE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
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
                          child: _buildSummaryBox(
                            label: 'TOTAL IN',
                            value: '${totalIn.toStringAsFixed(3)} $unitLabel',
                            bg: const Color(0xFFECFDF5),
                            textCol: const Color(0xFF047857),
                            isSelected: _filterDirection == 'INWARD',
                            borderCol: const Color(0xFF059669),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Total OUT (RED)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filterDirection = 'OUTWARD'),
                          child: _buildSummaryBox(
                            label: 'TOTAL OUT',
                            value: '${totalOut.toStringAsFixed(3)} $unitLabel',
                            bg: const Color(0xFFFEF2F2),
                            textCol: const Color(0xFFDC2626),
                            isSelected: _filterDirection == 'OUTWARD',
                            borderCol: const Color(0xFFDC2626),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Remaining Balance (BLUE)
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filterDirection = 'ALL'),
                          child: _buildSummaryBox(
                            label: 'REMAINING',
                            value: '${balance.toStringAsFixed(3)} $unitLabel',
                            bg: const Color(0xFFEFF6FF),
                            textCol: const Color(0xFF2563EB),
                            isSelected: _filterDirection == 'ALL',
                            borderCol: const Color(0xFF2563EB),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Prominent + Add Entry Button (Directly Below Summary)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => _showAddEntryModal(context, _selectedCategory),
                icon: const Icon(Icons.add, color: Colors.white),
                label: Text(
                  'Add New ${_selectedCategory.toUpperCase()} Entry',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 4. Filtered Material Transaction List Header + Advanced Filter Action Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_selectedCategory.toUpperCase()} Transactions (${filteredTransactions.length})',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                ),

                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        Icons.tune,
                        color: hasActiveAdvancedFilters ? AppTheme.goldDark : AppTheme.textMuted,
                      ),
                      onPressed: () => _showFilterOptionsModal(context),
                    ),
                    if (hasActiveAdvancedFilters || _filterDirection != 'ALL')
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _filterDirection = 'ALL';
                            _filterVendor = '';
                            _filterPurity = '';
                          });
                        },
                        child: const Text('Reset', style: TextStyle(color: Color(0xFFDC2626), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),

            filteredTransactions.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(30),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Text('No ${_filterDirection != "ALL" ? _filterDirection : ""} $_selectedCategory entries found.'),
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
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isInward ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isInward ? const Color(0xFF15803D) : const Color(0xFFDC2626),
                            ),
                          ),
                          title: Text('${entry.weight} $unitLabel (${entry.purity ?? "24K - 995"})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text('${entry.vendorName} • ${entry.timestamp}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('₹${entry.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                              const Text('Tap details ➔', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
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

  Widget _buildSummaryBox({
    required String label,
    required String value,
    required Color bg,
    required Color textCol,
    required bool isSelected,
    required Color borderCol,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isSelected ? borderCol : Colors.transparent, width: 2),
      ),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: textCol)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textCol), maxLines: 1),
        ],
      ),
    );
  }

  void _showAddEntryModal(BuildContext context, String category) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => MaterialModalBottomSheet(defaultCategory: category),
    );
  }

  void _showFilterOptionsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          top: 20, left: 20, right: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: AppTheme.bgCard,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Filter Transactions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(labelText: 'VENDOR / KARIGAR NAME', hintText: 'e.g. MMTC-PAMP / Ramesh'),
              onChanged: (val) => setState(() => _filterVendor = val),
            ),
            const SizedBox(height: 12),
            if (_selectedCategory == 'gold')
              DropdownButtonFormField<String>(
                initialValue: _filterPurity.isEmpty ? null : _filterPurity,
                decoration: const InputDecoration(labelText: 'FILTER BY PURITY'),
                items: const [
                  DropdownMenuItem(value: '', child: Text('All Purities')),
                  DropdownMenuItem(value: '24K - 995', child: Text('24K - 995')),
                  DropdownMenuItem(value: '24K - 999', child: Text('24K - 999')),
                  DropdownMenuItem(value: '22K - 916', child: Text('22K - 916')),
                  DropdownMenuItem(value: '18K - 750', child: Text('18K - 750')),
                ],
                onChanged: (val) => setState(() => _filterPurity = val ?? ''),
              ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      setState(() {
                        _filterVendor = '';
                        _filterPurity = '';
                        _filterDirection = 'ALL';
                      });
                      Navigator.pop(ctx);
                    },
                    child: const Text('RESET'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary),
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('APPLY FILTERS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEntryDetailDialog(BuildContext context, MaterialEntry entry, String unitLabel) {
    final isInward = entry.direction == 'INWARD';
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${entry.direction} ENTRY',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isInward ? const Color(0xFF15803D) : const Color(0xFFDC2626),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Text('Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (entry.photoUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(entry.photoUrl!, height: 120, width: double.infinity, fit: BoxFit.cover),
              ),
            const SizedBox(height: 12),
            _buildDetailRow('Timestamp:', entry.timestamp),
            _buildDetailRow('Weight:', '${entry.weight} $unitLabel'),
            if (entry.purity != null) _buildDetailRow('Purity:', entry.purity!),
            _buildDetailRow(isInward ? 'Vendor:' : 'Karigar:', entry.vendorName),
            _buildDetailRow('Rate:', '₹${entry.price}'),
            const Divider(),
            _buildDetailRow('Total Amount:', '₹${entry.totalAmount.toStringAsFixed(0)}', isBold: true),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CLOSE', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: isBold ? const Color(0xFF15803D) : AppTheme.textMain)),
        ],
      ),
    );
  }
}
