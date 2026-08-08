import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';

class ManufacturerDetailScreen extends StatelessWidget {
  final Manufacturer manufacturer;
  final Function(String) onDelete;

  const ManufacturerDetailScreen({
    super.key,
    required this.manufacturer,
    required this.onDelete,
  });

  Widget _buildAvatar(String name, String? photoUrl, {double radius = 30}) {
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
    const double goldIssued = 250.000;
    const double goldReturned = 139.500;
    final double goldRemaining = manufacturer.goldRemaining > 0 ? manufacturer.goldRemaining : (goldIssued - goldReturned);

    final recentJobs = [
      {'id': 'JOB-9042', 'product': '22K Antique Royal Signet Ring', 'gold': '14.200 g', 'status': 'In Progress', 'date': '04/08/2026'},
      {'id': 'JOB-9039', 'product': '18K Diamond Solitaire Bangle Set', 'gold': '45.000 g', 'status': 'In Progress', 'date': '02/08/2026'},
      {'id': 'JOB-9021', 'product': '24K Temple Heritage Choker Necklace', 'gold': '110.500 g', 'status': 'Completed', 'date': '28/07/2026'},
    ];

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text(manufacturer.name, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
            
            // Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Row(
                children: [
                  _buildAvatar(manufacturer.name, manufacturer.photoUrl, radius: 30),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(manufacturer.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Text(manufacturer.office, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Row(
                          children: [
                            Icon(Icons.phone_outlined, size: 14, color: AppTheme.textMuted),
                            SizedBox(width: 4),
                            Text('+91 98765 43210', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Default Charge: ₹${manufacturer.makingCharge.toStringAsFixed(0)} / g',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.goldDark),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Live System Statistics
            const Text('SYSTEM LIVE STATISTICS (READ-ONLY)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
            const SizedBox(height: 8),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              childAspectRatio: 1.8,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildStatCard('JOBS COMPLETED', '${manufacturer.jobsDone}', const Color(0xFFECFDF5), const Color(0xFF047857), const Color(0xFF065F46)),
                _buildStatCard('JOBS ONGOING', '${manufacturer.jobsOngoing}', const Color(0xFFEFF6FF), const Color(0xFF2563EB), const Color(0xFF1E40AF)),
                _buildStatCard('GOLD ISSUED', '${goldIssued.toStringAsFixed(3)} g', const Color(0xFFFEF3C7), const Color(0xFFB45309), const Color(0xFF92400E)),
                _buildStatCard('GOLD RETURNED', '${goldReturned.toStringAsFixed(3)} g', const Color(0xFFF0FDF4), const Color(0xFF16A34A), const Color(0xFF15803D)),
              ],
            ),

            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEA580C), width: 1.5),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('NET GOLD REMAINING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFC2410C))),
                      SizedBox(height: 2),
                      Text('Outstanding balance at workshop', style: TextStyle(fontSize: 10, color: Color(0xFF9A3412))),
                    ],
                  ),
                  Text('${goldRemaining.toStringAsFixed(3)} g', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFC2410C))),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Recent Manufacturing Activity
            const Text('RECENT MANUFACTURING ACTIVITY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
            const SizedBox(height: 8),

            ...recentJobs.map((job) {
              final isDone = job['status'] == 'Completed';
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppTheme.borderSubtle)),
                child: ListTile(
                  title: Text(job['product']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('Issued: ${job["gold"]} • ${job["date"]}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDone ? const Color(0xFFDCFCE7) : const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      job['status']!,
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDone ? const Color(0xFF059669) : const Color(0xFF2563EB)),
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Delete Manufacturer Action
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  backgroundColor: const Color(0xFFFEF2F2),
                ),
                onPressed: () => _confirmDelete(context),
                icon: const Icon(Icons.delete_outline, color: Color(0xFFDC2626)),
                label: const Text('Delete Manufacturer', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),

          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color bg, Color border, Color text) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: border)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: text)),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Manufacturer?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete ${manufacturer.name}? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
            onPressed: () {
              onDelete(manufacturer.id);
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
