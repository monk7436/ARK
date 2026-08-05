import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Company & Store Profile', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Company Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppTheme.goldPrimary,
                    child: const Text('A', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('ark labs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      SizedBox(height: 4),
                      Text('Rahul (Owner) • Sahyadri Tower Store', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Cloud Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Cloud Infrastructure & Sync', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                  SizedBox(height: 12),
                  ListTile(
                    leading: Icon(Icons.cloud_done, color: Color(0xFF15803D)),
                    title: Text('Neon PostgreSQL Database', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('Connected & Synced 🟢', style: TextStyle(fontSize: 11, color: Color(0xFF15803D))),
                  ),
                  ListTile(
                    leading: Icon(Icons.api, color: Color(0xFF15803D)),
                    title: Text('Render API Engine', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('ONLINE 24/7 🟢', style: TextStyle(fontSize: 11, color: Color(0xFF15803D))),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
