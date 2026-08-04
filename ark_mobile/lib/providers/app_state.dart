import 'package:flutter/foundation.dart';
import '../models/material_entry.dart';

class AppState extends ChangeNotifier {
  double liveGoldRate24K = 7200.0;
  double liveGoldRate22K = 6850.0;
  double liveSilverRate = 88.0;

  int activeBottomTab = 0;

  // Material Transactions (Gold 995 24K, Diamond, Gemstone)
  List<MaterialEntry> _materials = [
    MaterialEntry(
      id: 'tx-101',
      timestamp: '04/08/2026, 11:30 AM',
      direction: 'INWARD',
      materialType: 'gold',
      weight: 250.000,
      purity: '995 (24K)',
      vendorName: 'MMTC-PAMP Bullion Supplier',
      price: 7200,
      totalAmount: 1800000,
      photoUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
    ),
    MaterialEntry(
      id: 'tx-102',
      timestamp: '04/08/2026, 12:15 PM',
      direction: 'OUTWARD',
      materialType: 'gold',
      weight: 45.000,
      purity: '995 (24K)',
      vendorName: 'Ramesh Artisan Workshop',
      manufacturerId: 'mfg-1',
      price: 7200,
      totalAmount: 324000,
      productType: 'Necklace',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
    ),
    MaterialEntry(
      id: 'tx-103',
      timestamp: '04/08/2026, 01:00 PM',
      direction: 'INWARD',
      materialType: 'diamond',
      weight: 12.50,
      size: '2.5 mm VVS1',
      vendorName: 'Surat Diamond Syndicate',
      price: 45000,
      totalAmount: 562500,
      photoUrl: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=300',
    ),
  ];

  // Manufacturer Profiles
  List<Manufacturer> _manufacturers = [
    Manufacturer(
      id: 'mfg-1',
      name: 'Ramesh Artisan Workshop',
      office: 'Zaveri Bazaar, Mumbai',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      jobsDone: 42,
      jobsOngoing: 3,
      goldRemaining: 110.500,
      makingCharge: 450,
    ),
    Manufacturer(
      id: 'mfg-2',
      name: 'Swarn Artistry',
      office: 'Johri Bazaar, Jaipur',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      jobsDone: 88,
      jobsOngoing: 5,
      goldRemaining: 245.800,
      makingCharge: 400,
    ),
  ];

  // Tagged Inventory Items
  List<InventoryItem> _inventory = [
    InventoryItem(
      id: 'inv-1',
      tagCode: 'ARK-RNG-1001',
      name: '22K Antique Royal Signet Ring',
      category: 'Ring',
      purityKarat: '22K (91.6%)',
      grossWeight: 14.200,
      stoneWeight: 0.200,
      netWeight: 14.000,
      fineWeight: 12.824,
      makingCharge: 450,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
    ),
    InventoryItem(
      id: 'inv-2',
      tagCode: 'ARK-NCK-1002',
      name: '22K Gold Choker Necklace',
      category: 'Necklace',
      purityKarat: '22K (91.6%)',
      grossWeight: 45.200,
      stoneWeight: 3.200,
      netWeight: 42.000,
      fineWeight: 38.472,
      makingCharge: 500,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
    ),
  ];

  List<MaterialEntry> get materials => _materials;
  List<Manufacturer> get manufacturers => _manufacturers;
  List<InventoryItem> get inventory => _inventory;

  void setActiveTab(int index) {
    activeBottomTab = index;
    notifyListeners();
  }

  void addMaterialEntry(MaterialEntry entry) {
    _materials.insert(0, entry);
    
    // Update manufacturer balance if outward gold
    if (entry.direction == 'OUTWARD' && entry.manufacturerId != null) {
      final index = _manufacturers.indexWhere((m) => m.id == entry.manufacturerId);
      if (index != -1) {
        final current = _manufacturers[index];
        _manufacturers[index] = Manufacturer(
          id: current.id,
          name: current.name,
          office: current.office,
          photoUrl: current.photoUrl,
          jobsDone: current.jobsDone,
          jobsOngoing: current.jobsOngoing + 1,
          goldRemaining: current.goldRemaining + (entry.materialType == 'gold' ? entry.weight : 0),
          makingCharge: current.makingCharge,
        );
      }
    }
    notifyListeners();
  }

  void addManufacturer(Manufacturer mfg) {
    _manufacturers.add(mfg);
    notifyListeners();
  }

  void addInventoryItem(InventoryItem item) {
    _inventory.insert(0, item);
    notifyListeners();
  }
}
