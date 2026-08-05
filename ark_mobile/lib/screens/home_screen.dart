import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import 'material_list_screen.dart';
import 'manufacturing_screen.dart';
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
  final List<Map<String, String>> _stores = [
    {'name': 'Sahyadri Tower Store', 'city': 'Mumbai'},
    {'name': 'Zaveri Bazaar Main Vault', 'city': 'Mumbai'},
    {'name': 'Surat Diamond Hub', 'city': 'Surat'},
  ];

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    final filteredEntries = appState.materials.where((m) {
      final matchesSearch = m.vendorName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (m.productType?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      if (!matchesSearch) return false;
      if (_activeFilter == 'INWARD') return m.direction == 'INWARD';
      if (_activeFilter == 'OUTWARD') return m.direction == 'OUTWARD';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              
              // 1. Control App Style Top Header Card
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Top Bar
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: AppTheme.goldPrimary,
                              radius: 20,
                              child: const Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('ark labs', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                Text('Rahul', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white10,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text('EN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                            const SizedBox(width: 8),
                            // Team Management Icon
                            IconButton(
                              icon: const Icon(Icons.people_outline, color: Colors.white),
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => TeamManagementScreen(storeName: _activeStoreName)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Active Store Dropdown Card
                    GestureDetector(
                      onTap: () => _showStoreDropdownSheet(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('● ACTIVE STORE', style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 10)),
                                const SizedBox(height: 2),
                                Text(_activeStoreName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                              ],
                            ),
                            const CircleAvatar(
                              backgroundColor: Colors.white12,
                              radius: 16,
                              child: Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 20),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. Four Action Grid Boxes (2x2 Grid)
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                childAspectRatio: 1.5,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                children: [
                  _buildActionCard(
                    context,
                    title: 'Material (In)',
                    subtitle: 'Vault Inward',
                    icon: Icons.south_west,
                    iconBg: const Color(0xFFECFDF5),
                    iconColor: const Color(0xFF059669),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MaterialListScreen(initialDirection: 'INWARD'))),
                  ),

                  _buildActionCard(
                    context,
                    title: 'Material (Out)',
                    subtitle: 'Issue to Karigar',
                    icon: Icons.north_east,
                    iconBg: const Color(0xFFFEF2F2),
                    iconColor: const Color(0xFFDC2626),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MaterialListScreen(initialDirection: 'OUTWARD'))),
                  ),

                  _buildActionCard(
                    context,
                    title: 'Manufacturer',
                    subtitle: 'Karigars & Balances',
                    icon: Icons.build_circle_outlined,
                    iconBg: const Color(0xFFFAF5FF),
                    iconColor: const Color(0xFF9333EA),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ManufacturingScreen())),
                  ),

                  _buildActionCard(
                    context,
                    title: 'Customers',
                    subtitle: 'Shops & Invoices',
                    icon: Icons.people_alt_outlined,
                    iconBg: const Color(0xFFFFF7ED),
                    iconColor: const Color(0xFFEA580C),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicingScreen())),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // 3. Recent Activity Logs Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Recent Activity Logs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                  Icon(Icons.tune, size: 20, color: AppTheme.textMuted),
                ],
              ),
              const SizedBox(height: 12),

              // Search Bar
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: InputDecoration(
                  hintText: 'Search entries by vendor or product...',
                  prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderSubtle)),
                ),
              ),

              const SizedBox(height: 12),

              // Quick Filter Pills
              Row(
                children: ['ALL', 'INWARD', 'OUTWARD'].map((filter) {
                  final isSelected = _activeFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(filter, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? AppTheme.goldDark : AppTheme.textMuted)),
                      selected: isSelected,
                      selectedColor: const Color(0xFFFEF3C7),
                      backgroundColor: Colors.white,
                      onSelected: (_) => setState(() => _activeFilter = filter),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 12),

              // Entry List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredEntries.length,
                itemBuilder: (context, index) {
                  final entry = filteredEntries[index];
                  final isInward = entry.direction == 'INWARD';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppTheme.borderSubtle)),
                    child: ListTile(
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
                      title: Text('${entry.weight} g (${entry.purity ?? "24K - 995"})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text('${entry.vendorName} • ${entry.timestamp}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('₹${entry.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                          Text(entry.materialType.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldPrimary)),
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
    );
  }

  void _showStoreDropdownSheet(BuildContext context) {
    final nameCtrl = TextEditingController();
    final cityCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
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
                const Text('Select Store Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            ..._stores.map((s) {
              final isSelected = s['name'] == _activeStoreName;
              return Card(
                color: isSelected ? const Color(0xFFECFDF5) : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: isSelected ? const Color(0xFF34D399) : AppTheme.borderSubtle, width: isSelected ? 2 : 1),
                ),
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: Icon(Icons.store, color: isSelected ? const Color(0xFF15803D) : AppTheme.textMuted),
                  title: Text(s['name']!, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF15803D) : AppTheme.textMain)),
                  subtitle: Text('📍 ${s['city']}'),
                  trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF34D399)) : null,
                  onTap: () {
                    setState(() => _activeStoreName = s['name']!);
                    Navigator.pop(ctx);
                  },
                ),
              );
            }),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.goldDark, width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  _showAddStoreDialog(context);
                },
                icon: const Icon(Icons.add, color: AppTheme.goldDark),
                label: const Text('+ Add New Store Location', style: TextStyle(color: AppTheme.goldDark, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddStoreDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final cityCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Add New Store', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'STORE NAME', hintText: 'e.g. Surat Diamond Hub')),
            const SizedBox(height: 10),
            TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'CITY', hintText: 'e.g. Surat')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
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
            child: const Text('CREATE STORE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
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
          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain), maxLines: 1),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted), maxLines: 1),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
