import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/add_manufacturer_modal.dart';
import 'manufacturer_detail_screen.dart';

class ManufacturingScreen extends StatefulWidget {
  const ManufacturingScreen({super.key});

  @override
  State<ManufacturingScreen> createState() => _ManufacturingScreenState();
}

class _ManufacturingScreenState extends State<ManufacturingScreen> {
  // Helper to build photo or initials avatar (e.g. JB for Jitu bhai)
  Widget _buildAvatar(String name, String? photoUrl, {double radius = 25}) {
    final clean = photoUrl?.trim() ?? '';
    if (clean.isNotEmpty) {
      if (clean.startsWith('data:image')) {
        try {
          final bytes = base64Decode(clean.split(',').last);
          return CircleAvatar(
            radius: radius,
            backgroundImage: MemoryImage(bytes),
          );
        } catch (_) {}
      } else if (clean.startsWith('http')) {
        return CircleAvatar(
          radius: radius,
          backgroundImage: NetworkImage(clean),
        );
      }
    }

    String initials = 'MF';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isNotEmpty && parts[0].isNotEmpty) {
      if (parts.length == 1) {
        initials = parts[0].length >= 2 ? parts[0].substring(0, 2).toUpperCase() : parts[0].toUpperCase();
      } else {
        initials = '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
      }
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: const Color(0xFFD97706),
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: radius * 0.72,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

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
            // 2. MANUFACTURER LIST CARDS / PROPER EMPTY STATE
            manufacturers.isEmpty
                ? Container(
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
                        const Text(
                          'No manufacturers found',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Add your first manufacturer to get started.',
                          style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.goldPrimary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                          icon: const Icon(Icons.add, size: 16, color: Colors.white),
                          label: const Text('+ Add New', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AddManufacturerModal(
                                onSubmit: (mfg) => appState.addManufacturer(mfg),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
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
                          leading: _buildAvatar(mfg.name, mfg.photoUrl, radius: 25),
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
                              const Text('Completed', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                              Text('${mfg.jobsDone}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
