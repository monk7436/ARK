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

    // Global Universal Search Filter across materials, vendors, product types, and purities
    final filteredEntries = appState.materials.where((m) {
      final query = _searchQuery.toLowerCase().trim();
      if (query.isNotEmpty) {
        final matchesSearch = m.vendorName.toLowerCase().contains(query) ||
            (m.productType?.toLowerCase().contains(query) ?? false) ||
            (m.purity?.toLowerCase().contains(query) ?? false) ||
            m.materialType.toLowerCase().contains(query) ||
            m.id.toLowerCase().contains(query);
        if (!matchesSearch) return false;
      }

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
              
              // 1. COMPACT TOP COMPANY HEADER (30-40% Height Reduction)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSubtle),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Left: Logo & Company Name
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: AppTheme.goldPrimary,
                          radius: 18,
                          child: const Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('ark labs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                            Text('Rahul', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                          ],
                        ),
                      ],
                    ),

                    // Center: Active Store Selector
                    GestureDetector(
                      onTap: () => _showStoreDropdownSheet(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppTheme.bgPrimary,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 6, height: 6,
                              decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _activeStoreName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.textMain),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.keyboard_arrow_down, size: 14, color: AppTheme.textMuted),
                          ],
                        ),
                      ),
                    ),

                    // Right: Language Tag & Team Icon
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

              // 2. GLOBAL UNIVERSAL SEARCH BAR
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: InputDecoration(
                  hintText: 'Search customers, jewellery, manufacturers, transactions...',
                  hintStyle: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 18),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderSubtle)),
                ),
              ),

              const SizedBox(height: 14),

              // 3. CLEAN 2x2 QUICK ACTION GRID
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

                  // Card 2: Jobs
                  _buildActionCard(
                    context,
                    title: 'Jobs',
                    subtitle: 'Manufacturing Work',
                    badgeText: '3 Active Jobs',
                    icon: Icons.build_circle_outlined,
                    iconBg: const Color(0xFFEFF6FF),
                    iconColor: const Color(0xFF2563EB),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ManufacturingScreen())),
                  ),

                  // Card 3: Manufacturer
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

              const SizedBox(height: 18),

              // 4. RECENT ACTIVITY LOGS SECTION
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Activity Logs', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                  
                  // Filter Pills
                  Row(
                    children: ['ALL', 'INWARD', 'OUTWARD'].map((filter) {
                      final isSelected = _activeFilter == filter;
                      return Padding(
                        padding: const EdgeInsets.only(left: 4.0),
                        child: GestureDetector(
                          onTap: () => setState(() => _activeFilter = filter),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFFEF3C7) : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isSelected ? AppTheme.goldDark : AppTheme.borderSubtle),
                            ),
                            child: Text(
                              filter,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? AppTheme.goldDark : AppTheme.textMuted,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Transaction List Cards
              filteredEntries.isEmpty
                  ? Container(
                      padding: const EdgeInsets.all(24),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: const Text('No transactions match your search.', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filteredEntries.length,
                      itemBuilder: (context, index) {
                        final entry = filteredEntries[index];
                        final isInward = entry.direction == 'INWARD';
                        final photoUrl = entry.photoUrl;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppTheme.borderSubtle)),
                          child: ListTile(
                            leading: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isInward ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: photoUrl != null && photoUrl.startsWith('http')
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(photoUrl, fit: BoxFit.cover),
                                    )
                                  : Icon(
                                      isInward ? Icons.arrow_downward : Icons.arrow_upward,
                                      color: isInward ? const Color(0xFF059669) : const Color(0xFFDC2626),
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
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderSubtle),
          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 3, offset: Offset(0, 1))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)),
                  child: Text(badgeText, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: iconColor)),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain), maxLines: 1),
                Text(subtitle, style: const TextStyle(fontSize: 9.5, color: AppTheme.textMuted), maxLines: 1),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showStoreDropdownSheet(BuildContext context) {
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
}
