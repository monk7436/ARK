import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
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
            (m.purity != null && m.purity!.toLowerCase().contains(q)) ||
            (m.id.toLowerCase().contains(q));
        if (!matches) return false;
      }
      if (_activeFilter == 'INWARD') return m.direction == 'INWARD';
      if (_activeFilter == 'OUTWARD') return m.direction == 'OUTWARD';
      return true;
    }).toList();

    final activeJobsCount = appState.jobs.where((j) => j.status != 'Completed').length;

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                
                // 1. COMPACT TOP COMPANY HEADER
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
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('ark labs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                              Text('Rahul', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
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
                      badgeText: '$activeJobsCount Active Jobs',
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

                    // Card 4: Customers & Invoicing (Opens InvoicingScreen)
                    _buildActionCard(
                      context,
                      title: 'Customers',
                      subtitle: 'Invoicing & Profiles',
                      badgeText: 'Live Directory',
                      icon: Icons.receipt_long_outlined,
                      iconBg: const Color(0xFFECFDF5),
                      iconColor: const Color(0xFF059669),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicingScreen())),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // 3. GLOBAL SEARCH
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
                      hintText: 'Search material, vendors, jobs, purity...',
                      hintStyle: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                      prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 20),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(icon: const Icon(Icons.clear, size: 16), onPressed: () => setState(() => _searchQuery = ''))
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // 4. RECENT TRANSACTIONS HEADER WITH FILTERS
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Recent Transactions', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                    Row(
                      children: ['ALL', 'INWARD', 'OUTWARD'].map((f) {
                        final isSel = _activeFilter == f;
                        return Padding(
                          padding: const EdgeInsets.only(left: 4.0),
                          child: InkWell(
                            onTap: () => setState(() => _activeFilter = f),
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0xFFFEF3C7) : Colors.white,
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: isSel ? AppTheme.goldPrimary : AppTheme.borderSubtle),
                              ),
                              child: Text(f, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? AppTheme.goldDark : AppTheme.textMuted)),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // 5. TRANSACTION CARDS LIST / PROPER ACTIONABLE EMPTY STATE
                filtered.isEmpty
                    ? Container(
                        padding: const EdgeInsets.all(28),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'No recent transactions',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Add your first material entry to start tracking vault balances.',
                              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.goldPrimary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              ),
                              icon: const Icon(Icons.add, size: 14, color: Colors.white),
                              label: const Text('+ Add Entry', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const MaterialListScreen(initialDirection: 'INWARD')),
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final m = filtered[index];
                          final isInward = m.direction == 'INWARD';
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: const BorderSide(color: AppTheme.borderSubtle),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isInward ? const Color(0x2610B981) : const Color(0x26F43F5E),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  isInward ? Icons.arrow_downward : Icons.arrow_upward,
                                  color: isInward ? AppTheme.inwardGreen : AppTheme.outwardRose,
                                  size: 18,
                                ),
                              ),
                              title: Text(
                                '${m.weight.toStringAsFixed(2)} ${m.materialType == 'gold' ? 'g' : 'ct'} (${m.purity ?? m.materialType.toUpperCase()})',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain),
                              ),
                              subtitle: Text(
                                '${m.vendorName} • ${m.timestamp}',
                                style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                              ),
                              trailing: Text(
                                '₹ ${m.totalAmount.toStringAsFixed(0)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: isInward ? AppTheme.inwardGreen : AppTheme.outwardRose,
                                ),
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
                  decoration: BoxDecoration(
                    color: AppTheme.bgPrimary,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
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
}
