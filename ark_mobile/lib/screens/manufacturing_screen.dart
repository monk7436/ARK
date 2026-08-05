import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';
import '../widgets/add_manufacturer_modal.dart';
import 'manufacturer_detail_screen.dart';

class ManufacturingScreen extends StatefulWidget {
  const ManufacturingScreen({super.key});

  @override
  State<ManufacturingScreen> createState() => _ManufacturingScreenState();
}

class _ManufacturingScreenState extends State<ManufacturingScreen> {
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final manufacturers = appState.manufacturers;

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      // 1. REDESIGNED TOP APP BAR (Header: ← Back | Manufacturers | + Add New)
      appBar: AppBar(
        title: const Text('Manufacturers', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
                elevation: 2,
              ),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AddManufacturerModal(
                    onSubmit: (mfg) => appState.addManufacturer(mfg),
                  ),
                );
              },
              icon: const Icon(Icons.add, size: 16, color: Colors.white),
              label: const Text('+ Add New', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            // 2. MANUFACTURER LIST CARDS
            manufacturers.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(32),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: const Text('No manufacturers added yet. Tap + Add New above to register a Karigar.', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: manufacturers.length,
                    itemBuilder: (context, index) {
                      final mfg = manufacturers[index];

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: AppTheme.borderSubtle),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(12),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ManufacturerDetailScreen(
                                  manufacturer: mfg,
                                  onDelete: (id) {
                                    setState(() {
                                      manufacturers.removeWhere((m) => m.id == id);
                                    });
                                  },
                                ),
                              ),
                            );
                          },
                          leading: CircleAvatar(
                            radius: 25,
                            backgroundColor: const Color(0xFF9333EA),
                            backgroundImage: mfg.photoUrl.startsWith('http') ? NetworkImage(mfg.photoUrl) : null,
                            child: !mfg.photoUrl.startsWith('http')
                                ? Text(mfg.name.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18))
                                : null,
                          ),
                          title: Text(mfg.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 2),
                              Text('📍 ${mfg.office}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                                    child: Text('Gold Remaining: ${mfg.goldRemaining.toStringAsFixed(3)} g', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldDark)),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                                    child: Text('Ongoing: ${mfg.jobsOngoing}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('${mfg.jobsDone} Done', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF059669))),
                              Text('₹${mfg.makingCharge.toStringAsFixed(0)}/g', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                              const SizedBox(height: 2),
                              const Icon(Icons.chevron_right, size: 18, color: AppTheme.textMuted),
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
}
