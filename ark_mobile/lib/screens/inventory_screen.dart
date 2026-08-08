import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  String _searchQuery = '';

  void _showTagItemDialog(BuildContext context, AppState appState) {
    final nameCtrl = TextEditingController();
    final grossCtrl = TextEditingController();
    final stoneCtrl = TextEditingController(text: '0.0');
    final mcCtrl = TextEditingController(text: '450');
    String purity = '22K (91.6%)';
    String category = 'Ring';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Tag New Jewelry Piece', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Item Name *', hintText: 'e.g. 22K Royal Signet Ring')),
              const SizedBox(height: 8),
              TextField(controller: grossCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Gross Weight (g) *', hintText: '14.200')),
              const SizedBox(height: 8),
              TextField(controller: stoneCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Stone Weight (g)', hintText: '0.200')),
              const SizedBox(height: 8),
              TextField(controller: mcCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Making Charge (₹/g)', hintText: '450')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary),
            onPressed: () {
              final gross = double.tryParse(grossCtrl.text) ?? 0.0;
              final stone = double.tryParse(stoneCtrl.text) ?? 0.0;
              final net = gross - stone;
              final fine = net * 0.916;

              if (nameCtrl.text.isNotEmpty && gross > 0) {
                final newItem = InventoryItem(
                  id: 'inv-${DateTime.now().millisecondsSinceEpoch}',
                  tagCode: 'ARK-TAG-${1000 + (appState.inventory.length + 1)}',
                  name: nameCtrl.text,
                  category: category,
                  purityKarat: purity,
                  grossWeight: gross,
                  stoneWeight: stone,
                  netWeight: net,
                  fineWeight: fine,
                  makingCharge: double.tryParse(mcCtrl.text) ?? 450.0,
                  status: 'IN_STOCK',
                  photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
                );
                appState.addInventoryItem(newItem);
                Navigator.pop(ctx);
              }
            },
            child: const Text('Save & Tag', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final items = appState.inventory.where((i) {
      final q = _searchQuery.toLowerCase().trim();
      if (q.isEmpty) return true;
      return i.name.toLowerCase().contains(q) || i.tagCode.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Tagged Jewelry Catalog', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textMain),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0, top: 8.0, bottom: 8.0),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.goldPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                padding: const EdgeInsets.symmetric(horizontal: 12),
              ),
              icon: const Icon(Icons.add, size: 16, color: Colors.white),
              label: const Text('+ Tag Item', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              onPressed: () => _showTagItemDialog(context, appState),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Search Bar
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search, color: AppTheme.textDim),
                  hintText: 'Search Tag ID (e.g. ARK-TAG-1001) or item name...',
                  hintStyle: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Item Cards List / Actionable Empty State
            Expanded(
              child: items.isEmpty
                  ? Center(
                      child: Container(
                        padding: const EdgeInsets.all(36),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('No inventory items found', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                            const SizedBox(height: 4),
                            const Text('Tag your first jewelry piece to add it to the inventory catalog.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted), textAlign: TextAlign.center),
                            const SizedBox(height: 14),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                              icon: const Icon(Icons.add, size: 16, color: Colors.white),
                              label: const Text('+ Tag Item', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                              onPressed: () => _showTagItemDialog(context, appState),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final item = items[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppTheme.borderSubtle)),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    item.photoUrl,
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.goldGlow,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.tagCode,
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldPrimary),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Gross: ${item.grossWeight.toStringAsFixed(2)}g | Net: ${item.netWeight.toStringAsFixed(2)}g | Fine: ${item.fineWeight.toStringAsFixed(2)}g',
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
            ),
          ],
        ),
      ),
    );
  }
}
