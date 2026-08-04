import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class ManufacturingScreen extends StatelessWidget {
  const ManufacturingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Karigar / Manufacturer Profiles',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain),
            ),
            const SizedBox(height: 12),

            // Manufacturer Cards List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: appState.manufacturers.length,
              itemBuilder: (context, index) {
                final m = appState.manufacturers[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundImage: NetworkImage(m.photoUrl),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    m.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textMain),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    m.office,
                                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '₹ ${m.makingCharge.toStringAsFixed(0)}/g',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.goldPrimary, fontSize: 13),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        const Divider(color: AppTheme.borderSubtle, height: 1),
                        const SizedBox(height: 12),

                        // Metrics
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem('24K GOLD HELD', '${m.goldRemaining.toStringAsFixed(2)}g', AppTheme.goldPrimary),
                            _buildStatItem('ONGOING JOBS', '${m.jobsOngoing}', const Color(0xFF38BDF8)),
                            _buildStatItem('JOBS DONE', '${m.jobsDone}', AppTheme.inwardGreen),
                          ],
                        ),
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

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}
