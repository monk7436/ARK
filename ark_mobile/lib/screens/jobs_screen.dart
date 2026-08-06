import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/job_modal.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  final List<Map<String, dynamic>> _jobs = [
    {
      'id': 'job-101',
      'jobNumber': '001',
      'timestamp': '04/08/2026, 11:30 AM',
      'manufacturerId': 'mfg-1',
      'manufacturerName': 'Ramesh Artisan Workshop',
      'productName': '22K Antique Royal Signet Ring',
      'goldWeight': 14.200,
      'goldPurity': '22K',
      'diamondRows': [{'weight': '0.25', 'size': '0.25 ct'}],
      'gemstoneRows': [{'weight': '0.10', 'size': 'Ruby 3mm'}],
      'notes': 'Yellow Gold finish with antique polish',
      'status': 'In Progress'
    },
    {
      'id': 'job-102',
      'jobNumber': '002',
      'timestamp': '02/08/2026, 03:15 PM',
      'manufacturerId': 'mfg-1',
      'manufacturerName': 'Ramesh Artisan Workshop',
      'productName': '18K Diamond Solitaire Bangle Set',
      'goldWeight': 45.000,
      'goldPurity': '18K',
      'diamondRows': [{'weight': '1.20', 'size': '0.10 ct'}, {'weight': '0.80', 'size': '0.05 ct'}],
      'gemstoneRows': [],
      'notes': 'White Gold Rhodium plating requested',
      'status': 'In Progress'
    },
    {
      'id': 'job-103',
      'jobNumber': '003',
      'timestamp': '28/07/2026, 10:00 AM',
      'manufacturerId': 'mfg-1',
      'manufacturerName': 'Ramesh Artisan Workshop',
      'productName': '24K Temple Heritage Choker Necklace',
      'goldWeight': 110.500,
      'goldPurity': '24K',
      'diamondRows': [],
      'gemstoneRows': [{'weight': '2.50', 'size': 'Emerald 5x7 mm'}],
      'notes': 'Traditional Nakshi work',
      'status': 'Completed'
    }
  ];

  String _getNextJobNumber() {
    final nextSeq = _jobs.length + 1;
    return nextSeq.toString().padLeft(3, '0');
  }

  void _saveJob(Map<String, dynamic> jobMap) {
    setState(() {
      final index = _jobs.indexWhere((j) => j['id'] == jobMap['id']);
      if (index != -1) {
        _jobs[index] = jobMap;
      } else {
        _jobs.insert(0, jobMap);
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
                      final isDone = job['status'] == 'Completed';

                      final List dList = job['diamondRows'] ?? [];
                      final List gList = job['gemstoneRows'] ?? [];

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
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFBFDBFE))),
                                        child: Text('#${job["jobNumber"]}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(job['productName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
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
                                          job['status'],
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
                                              nextJobNumber: job['jobNumber'],
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
                              Text('📍 ${job["manufacturerName"]} • 🕒 ${job["timestamp"]}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),

                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: [
                                  if ((job['goldWeight'] ?? 0) > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: const Color(0xFFFFFBE8), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFFDE68A))),
                                      child: Text('Gold: ${job["goldWeight"]} g (${job["goldPurity"]})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                                    ),

                                  ...dList.map((d) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFBFDBFE))),
                                    child: Text('Diamond: ${d["weight"]} ct (${d["size"] ?? "Standard"})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF))),
                                  )),

                                  ...gList.map((g) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: const Color(0xFFFAF5FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE9D5FF))),
                                    child: Text('Gemstone: ${g["weight"]} ct (${g["size"] ?? "Standard"})', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8))),
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
