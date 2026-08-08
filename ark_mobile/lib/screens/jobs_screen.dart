import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/material_entry.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/job_modal.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  // Ordered by latest created job first (e.g. #003, #002, #001)
  final List<JobEntry> _jobs = [
    JobEntry(
      id: 'job-103',
      jobNumber: '003',
      timestamp: '04/08/2026, 05:45 PM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '24K Temple Heritage Choker Necklace',
      goldWeight: 110.500,
      goldPurity: '24K',
      diamondItems: [],
      gemstoneItems: [GemstoneItem(id: 'g-1', weight: 2.50, size: 'Emerald 5x7 mm', stoneType: 'Emerald')],
      notes: 'Traditional Nakshi work with fine filigree',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
      photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'],
      status: 'Completed',
    ),
    JobEntry(
      id: 'job-102',
      jobNumber: '002',
      timestamp: '02/08/2026, 03:15 PM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '18K Diamond Solitaire Bangle Set',
      goldWeight: 45.000,
      goldPurity: '18K',
      diamondItems: [
        DiamondItem(id: 'd-1', weightCt: 1.20, sizeMm: 2.5, shape: 'Round'),
        DiamondItem(id: 'd-2', weightCt: 0.80, sizeMm: 2.0, shape: 'Oval'),
      ],
      gemstoneItems: [],
      notes: 'White Gold Rhodium plating requested',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
      photos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'],
      status: 'In Progress',
    ),
    JobEntry(
      id: 'job-101',
      jobNumber: '001',
      timestamp: '28/07/2026, 11:30 AM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '22K Antique Royal Signet Ring',
      goldWeight: 14.200,
      goldPurity: '22K',
      diamondItems: [
        DiamondItem(id: 'd-3', weightCt: 0.25, sizeMm: 2.5, shape: 'Oval'),
      ],
      gemstoneItems: [GemstoneItem(id: 'g-2', weight: 0.10, size: 'Ruby 3mm', stoneType: 'Ruby')],
      notes: 'Yellow Gold finish with antique matte polish',
      photoUrl: '',
      photos: [],
      status: 'In Progress',
    ),
  ];

  String _getNextJobNumber() {
    final nextSeq = _jobs.length + 1;
    return nextSeq.toString().padLeft(3, '0');
  }

  void _saveJob(JobEntry job) {
    setState(() {
      final index = _jobs.indexWhere((j) => j.id == job.id);
      if (index != -1) {
        _jobs[index] = job;
      } else {
        // Latest created job is ALWAYS at the very top (index 0)
        _jobs.insert(0, job);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Jobs', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
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
                backgroundColor: const Color(0xFF2563EB),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                elevation: 2,
              ),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => JobModal(
                    manufacturers: appState.manufacturers,
                    nextJobNumber: _getNextJobNumber(),
                    onSubmit: _saveJob,
                  ),
                );
              },
              icon: const Icon(Icons.add, size: 16, color: Colors.white),
              label: const Text('Create Job', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _jobs.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(32),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.borderSubtle)),
                    child: const Text('No jobs created yet. Tap Create Job above.', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _jobs.length,
                    itemBuilder: (context, index) {
                      final job = _jobs[index];
                      final isDone = job.status == 'Completed';
                      final String photoUrl = (job.photoUrl ?? (job.photos.isNotEmpty ? job.photos.first : '')).toString();

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppTheme.borderSubtle)),
                        child: Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      if (photoUrl.isNotEmpty) ...[
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(8),
                                          child: Image.network(photoUrl, width: 36, height: 36, fit: BoxFit.cover),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFBFDBFE))),
                                        child: Text('#${job.jobNumber}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                      ),
                                      const SizedBox(width: 8),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 160),
                                        child: Text(job.productName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain), overflow: TextOverflow.ellipsis),
                                      ),
                                    ],
                                  ),

                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: isDone ? const Color(0xFFDCFCE7) : const Color(0xFFEFF6FF),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          job.status,
                                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDone ? const Color(0xFF059669) : const Color(0xFF2563EB)),
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.edit_outlined, size: 18, color: AppTheme.textMuted),
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (ctx) => JobModal(
                                              initialJob: job,
                                              manufacturers: appState.manufacturers,
                                              nextJobNumber: job.jobNumber,
                                              onSubmit: _saveJob,
                                            ),
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text('📍 ${job.manufacturerName} • 🕒 ${job.timestamp}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),

                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: [
                                  if (job.goldWeight > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: const Color(0xFFFFFBE8), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFFDE68A))),
                                      child: Text('Gold: ${job.goldWeight} g (${job.goldPurity})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                                    ),

                                  ...job.diamondItems.map((d) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFBFDBFE))),
                                    child: Text('Diamond: ${d.weightCt.toStringAsFixed(2)} ct (${d.sizeDisplay} ${d.effectiveShape})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                                  )),

                                  ...job.gemstoneItems.map((g) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: const Color(0xFFFAF5FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE9D5FF))),
                                    child: Text('Gemstone: ${g.weight.toStringAsFixed(2)} ct (${g.size})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8))),
                                  )),
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
}
