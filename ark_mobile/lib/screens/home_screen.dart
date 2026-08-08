import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';
import 'material_list_screen.dart';
import 'manufacturing_screen.dart';
import 'jobs_screen.dart';
import 'invoicing_screen.dart';
import 'team_management_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _searchQuery = '';
  String _activeFilter = 'ALL';
  String _activeStoreName = 'Sahyadri Tower Store';

  final List<Map<String, dynamic>> _stores = [
    {'name': 'Sahyadri Tower Store', 'city': 'Mumbai'},
    {'name': 'Zaveri Bazaar Main Vault', 'city': 'Mumbai'},
    {'name': 'Surat Diamond Hub', 'city': 'Surat'},
  ];

  void _showStorePicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Select Store / Vault', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              ..._stores.map((s) {
                final isSelected = s['name'] == _activeStoreName;
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.storefront, color: isSelected ? AppTheme.goldPrimary : AppTheme.textMuted),
                  title: Text(s['name']!, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? AppTheme.goldDark : AppTheme.textMain)),
                  subtitle: Text(s['city']!, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  trailing: isSelected ? const Icon(Icons.check_circle, color: AppTheme.goldPrimary, size: 20) : null,
                  onTap: () {
                    setState(() => _activeStoreName = s['name']!);
                    Navigator.pop(ctx);
                  },
                );
              }),
              const Divider(),
              TextButton.icon(
                icon: const Icon(Icons.add, color: AppTheme.goldPrimary),
                label: const Text('+ Add New Store Location', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.goldPrimary)),
                onPressed: () {
                  Navigator.pop(ctx);
                  _showAddStoreDialog();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddStoreDialog() {
    final nameCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Add New Store', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Store / Vault Name', hintText: 'e.g. Bandra Flagship')),
            const SizedBox(height: 10),
            TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'City / Location', hintText: 'e.g. Mumbai')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary),
            onPressed: () {
              if (nameCtrl.text.isNotEmpty) {
                setState(() {
                  _stores.add({'name': nameCtrl.text, 'city': cityCtrl.text.isEmpty ? 'Mumbai' : cityCtrl.text});
                  _activeStoreName = nameCtrl.text;
                });
                Navigator.pop(ctx);
              }
            },
            child: const Text('Add Store', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    final filtered = appState.materials.where((m) {
      final q = _searchQuery.toLowerCase().trim();
      if (q.isNotEmpty) {
        final matches = (m.vendorName.toLowerCase().contains(q)) ||
            (m.materialType.toLowerCase().contains(q)) ||
            (m.purity.toLowerCase().contains(q)) ||
            (m.id.toLowerCase().contains(q));
        if (!matches) return false;
      }
      if (_activeFilter == 'INWARD') return m.direction == 'INWARD';
      if (_activeFilter == 'OUTWARD') return m.direction == 'OUTWARD';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                
                // 1. COMPACT TOP COMPANY HEADER (-35% Height Reduction)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Logo & Name
                      Row(
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFD97706), Color(0xFFB45309)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(9),
                            ),
                            alignment: Alignment.center,
                            child: const Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('ark labs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                              Text(appState.companyInfo.ownerName, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            ],
                          ),
                        ],
                      ),

                      // Center: Store Selector
                      InkWell(
                        onTap: _showStorePicker,
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.bgPrimary,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppTheme.borderSubtle),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                              const SizedBox(width: 4),
                              ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 100),
                                child: Text(_activeStoreName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ),
                              const Icon(Icons.arrow_drop_down, size: 16, color: AppTheme.textMuted),
                            ],
                          ),
                        ),
                      ),

                      // Right: Language & Team Management Icon
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.bgPrimary,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('EN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                          ),
                          const SizedBox(width: 4),
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: const EdgeInsets.all(4),
                            icon: const Icon(Icons.people_outline, color: AppTheme.textMain, size: 18),
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => TeamManagementScreen(storeName: _activeStoreName)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 2. QUICK ACTIONS GRID (DIRECTLY BELOW COMPACT HEADER)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  childAspectRatio: 1.4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  children: [
                    // Card 1: Material
                    _buildActionCard(
                      context,
                      title: 'Material',
                      subtitle: 'Vault In & Issue Out',
                      badgeText: '${appState.materials.length} Entries',
                      icon: Icons.layers_outlined,
                      iconBg: const Color(0xFFFEF3C7),
                      iconColor: const Color(0xFFB45309),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MaterialListScreen(initialDirection: 'INWARD'))),
                    ),

                    // Card 2: Jobs (Opens JobsScreen)
                    _buildActionCard(
                      context,
                      title: 'Jobs',
                      subtitle: 'Manufacturing Work',
                      badgeText: '3 Active Jobs',
                      icon: Icons.build_circle_outlined,
                      iconBg: const Color(0xFFEFF6FF),
                      iconColor: const Color(0xFF2563EB),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JobsScreen())),
                    ),

                    // Card 3: Manufacturer (Opens ManufacturingScreen)
                    _buildActionCard(
                      context,
                      title: 'Manufacturer',
                      subtitle: 'Karigars & Balances',
                      badgeText: '${appState.manufacturers.length} Karigars',
                      icon: Icons.business_center_outlined,
                      iconBg: const Color(0xFFFAF5FF),
                      iconColor: const Color(0xFF9333EA),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ManufacturingScreen())),
                    ),

                    // Card 4: Customers
                    _buildActionCard(
                      context,
                      title: 'Customers',
                      subtitle: 'Shops & Invoices',
                      badgeText: '15 Accounts',
                      icon: Icons.people_alt_outlined,
                      iconBg: const Color(0xFFFFF7ED),
                      iconColor: const Color(0xFFEA580C),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicingScreen())),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // 3. GLOBAL UNIVERSAL SEARCH (IMMEDIATELY BELOW QUICK ACTIONS)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.borderSubtle),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search customers, jewellery, manufacturers, products, transactions...',
                      hintStyle: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                      prefixIcon: const Icon(Icons.search, size: 20, color: AppTheme.textMuted),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16, color: AppTheme.textMuted),
                              onPressed: () => setState(() => _searchQuery = ''),
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // 4. RECENT TRANSACTIONS
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Recent Transactions', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                    Row(
                      children: [
                        _buildFilterChip('ALL'),
                        const SizedBox(width: 4),
                        _buildFilterChip('INWARD'),
                        const SizedBox(width: 4),
                        _buildFilterChip('OUTWARD'),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // List of Recent Transactions
                filtered.isEmpty
                    ? Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
                        child: const Text('No transactions found matching your search.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final item = filtered[index];
                          final isInward = item.direction == 'INWARD';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppTheme.borderSubtle)),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              onTap: () => _showEntryDetailsModal(context, item),
                              leading: Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  isInward ? Icons.arrow_downward : Icons.arrow_upward,
                                  color: isInward ? const Color(0xFF059669) : const Color(0xFFDC2626),
                                  size: 20,
                                ),
                              ),
                              title: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(item.direction, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isInward ? const Color(0xFF059669) : const Color(0xFFDC2626))),
                                  ),
                                  const SizedBox(width: 6),
                                  Text('${item.weight} g (${item.purity})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                                ],
                              ),
                              subtitle: Text('${item.vendorName} • ${item.timestamp}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text('₹${item.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                                  Text(item.materialType.toUpperCase(), style: const TextStyle(fontSize: 9, color: AppTheme.goldDark, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),

              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _activeFilter == label;
    return InkWell(
      onTap: () => setState(() => _activeFilter = label),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFEF3C7) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: isSelected ? AppTheme.goldPrimary : AppTheme.borderSubtle),
        ),
        child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? AppTheme.goldDark : AppTheme.textMuted)),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String badgeText,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderSubtle),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(999)),
                  child: Text(badgeText, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                Text(subtitle, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEntryDetailsModal(BuildContext context, MaterialEntry entry) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${entry.direction} DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: entry.direction == 'INWARD' ? const Color(0xFF059669) : const Color(0xFFDC2626))),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: [
                    _buildRow('Material:', entry.materialType.toUpperCase()),
                    _buildRow('Weight:', '${entry.weight} g'),
                    if (entry.purity.isNotEmpty) _buildRow('Purity:', entry.purity),
                    _buildRow('Vendor / Karigar:', entry.vendorName),
                    _buildRow('Timestamp:', entry.timestamp),
                    const Divider(),
                    _buildRow('Total Value:', '₹${entry.totalAmount.toStringAsFixed(0)}', isBold: true),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          Text(value, style: TextStyle(fontSize: 12, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: AppTheme.textMain)),
        ],
      ),
    );
  }
}
