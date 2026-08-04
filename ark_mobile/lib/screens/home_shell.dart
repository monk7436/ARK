import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import 'materials_screen.dart';
import 'manufacturing_screen.dart';
import 'inventory_screen.dart';
import 'invoicing_screen.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({super.key});

  static const List<Widget> _screens = [
    MaterialsScreen(),
    ManufacturingScreen(),
    InventoryScreen(),
    InvoicingScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.goldPrimary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.layers, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Text('ARK', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.textMain)),
                    SizedBox(width: 6),
                    Text('JEWELRY SOFTWARE', style: TextStyle(fontSize: 10, color: AppTheme.goldPrimary, fontWeight: FontWeight.bold)),
                  ],
                ),
                Text(
                  'Live 24K: ₹${appState.liveGoldRate24K.toStringAsFixed(0)}/g • 22K: ₹${appState.liveGoldRate22K.toStringAsFixed(0)}/g',
                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                ),
              ],
            ),
          ],
        ),
      ),
      body: IndexedStack(
        index: appState.activeBottomTab,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: appState.activeBottomTab,
        onTap: (index) => appState.setActiveTab(index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.layers_outlined),
            activeIcon: Icon(Icons.layers),
            label: 'Materials',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build_outlined),
            activeIcon: Icon(Icons.build),
            label: 'Manufacturing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2_outlined),
            activeIcon: Icon(Icons.inventory_2),
            label: 'Inventory',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Customers',
          ),
        ],
      ),
    );
  }
}
