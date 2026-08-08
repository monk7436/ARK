import 'package:flutter/foundation.dart';
import '../models/material_entry.dart';
import '../services/api_service.dart';

class DiamondStockInfo {
  final double sizeMm;
  final String shape;
  final double totalReceived;
  final double totalIssued;
  final double available;

  DiamondStockInfo({
    required this.sizeMm,
    required this.shape,
    required this.totalReceived,
    required this.totalIssued,
    required this.available,
  });
}

class AppState extends ChangeNotifier {
  double liveGoldRate24K = 7200.0;
  double liveGoldRate22K = 6850.0;
  double liveSilverRate = 88.0;

  int activeBottomTab = 0;
  bool isSyncing = false;

  AppState() {
    initLiveData();
  }

  Future<void> initLiveData() async {
    isSyncing = true;
    notifyListeners();

    try {
      final remoteMaterials = await ApiService.fetchMaterials();
      if (remoteMaterials.isNotEmpty) {
        _materials = remoteMaterials;
      }

      final remoteMfg = await ApiService.fetchManufacturers();
      if (remoteMfg.isNotEmpty) {
        _manufacturers = remoteMfg;
      }
    } catch (e) {
      debugPrint('Sync failed: $e');
    } finally {
      isSyncing = false;
      notifyListeners();
    }
  }

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
      timestamp: '04/08/2026, 01:15 PM',
      direction: 'INWARD',
      materialType: 'diamond',
      weight: 5.000,
      vendorName: 'Surat Diamond Syndicate',
      price: 45000,
      totalAmount: 225000,
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
      diamondItems: [
        DiamondItem(
          id: 'd-item-init-1',
          parentId: 'tx-102',
          weightCt: 5.00,
          sizeMm: 2.5,
          shape: 'Oval',
        ),
        DiamondItem(
          id: 'd-item-init-2',
          parentId: 'tx-102',
          weightCt: 10.00,
          sizeMm: 2.5,
          shape: 'Round',
        ),
        DiamondItem(
          id: 'd-item-init-3',
          parentId: 'tx-102',
          weightCt: 4.50,
          sizeMm: 3.0,
          shape: 'Oval',
        ),
      ],
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
  ];

  // Tagged Inventory Items
  final List<InventoryItem> _inventory = [
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
  ];

  List<MaterialEntry> get materials => _materials;
  List<Manufacturer> get manufacturers => _manufacturers;
  List<InventoryItem> get inventory => _inventory;

  // --- DIAMOND INVENTORY EXACT MATCHING ENGINE ---

  // Get available carats for an exact (sizeMm, shape)
  double getAvailableDiamondStock(double sizeMm, String shape, [String? customShape]) {
    final shapeKey = shape == 'Other' ? (customShape ?? 'Other') : shape;
    final sizeKey = double.parse(sizeMm.toStringAsFixed(1));

    double received = 0.0;
    double issued = 0.0;

    for (final mat in _materials) {
      for (final d in mat.diamondItems) {
        final dSize = double.parse(d.sizeMm.toStringAsFixed(1));
        final dShape = d.effectiveShape;

        if (dSize == sizeKey && dShape.toLowerCase() == shapeKey.toLowerCase()) {
          if (mat.direction == 'INWARD') {
            received += d.weightCt;
          } else {
            issued += d.weightCt;
          }
        }
      }
    }

    return (received - issued) > 0 ? (received - issued) : 0.0;
  }

  // Group diamond inventory by Size (mm) -> Shape -> Stock Breakdown
  Map<String, List<DiamondStockInfo>> getGroupedDiamondStock() {
    final Map<String, Map<String, List<double>>> aggregator = {};

    for (final mat in _materials) {
      for (final d in mat.diamondItems) {
        final sizeStr = '${d.sizeMm.toStringAsFixed(1)} mm';
        final shapeStr = d.effectiveShape;

        if (!aggregator.containsKey(sizeStr)) {
          aggregator[sizeStr] = {};
        }
        if (!aggregator[sizeStr]!.containsKey(shapeStr)) {
          aggregator[sizeStr]![shapeStr] = [0.0, 0.0]; // [received, issued]
        }

        if (mat.direction == 'INWARD') {
          aggregator[sizeStr]![shapeStr]![0] += d.weightCt;
        } else {
          aggregator[sizeStr]![shapeStr]![1] += d.weightCt;
        }
      }
    }

    final Map<String, List<DiamondStockInfo>> result = {};
    aggregator.forEach((sizeStr, shapes) {
      final double sizeVal = double.tryParse(sizeStr.replaceAll(' mm', '')) ?? 2.5;
      result[sizeStr] = shapes.entries.map((e) {
        final rec = e.value[0];
        final iss = e.value[1];
        return DiamondStockInfo(
          sizeMm: sizeVal,
          shape: e.key,
          totalReceived: rec,
          totalIssued: iss,
          available: (rec - iss) > 0 ? (rec - iss) : 0.0,
        );
      }).toList();
    });

    return result;
  }

  // Validate diamond stock for Job creation (returns null if valid, or error message if short)
  String? validateJobDiamondStock(List<DiamondItem> items) {
    for (final item in items) {
      if (item.weightCt > 0) {
        final available = getAvailableDiamondStock(item.sizeMm, item.shape, item.customShape);
        if (available < item.weightCt) {
          final short = item.weightCt - available;
          return 'Insufficient Diamond Stock for ${item.sizeMm.toStringAsFixed(1)} mm ${item.effectiveShape}.\nRequired: ${item.weightCt.toStringAsFixed(2)} ct | Available: ${available.toStringAsFixed(2)} ct | Short: ${short.toStringAsFixed(2)} ct';
        }
      }
    }
    return null;
  }

  void setActiveTab(int index) {
    activeBottomTab = index;
    notifyListeners();
  }

  void addMaterialEntry(MaterialEntry entry) {
    _materials.insert(0, entry);
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
    ApiService.createMaterial(entry);
  }

  // Auto-generate Material OUT when a Job with diamonds is created/updated
  void recordJobDiamondOutward(JobEntry job) {
    // Remove previous auto Material OUT for this job if any
    _materials.removeWhere((m) => m.jobId == job.id && m.direction == 'OUTWARD');

    if (job.diamondItems.isNotEmpty) {
      final outEntry = MaterialEntry(
        id: 'tx-auto-out-${job.id}',
        timestamp: job.timestamp,
        direction: 'OUTWARD',
        materialType: 'diamond',
        weight: job.diamondItems.fold(0.0, (s, d) => s + d.weightCt),
        vendorName: 'Auto Issued from Vault',
        manufacturerId: job.manufacturerId,
        jobId: job.id,
        price: 45000,
        totalAmount: job.diamondItems.fold(0.0, (s, d) => s + d.weightCt) * 45000,
        notes: 'Auto Material OUT for Job #${job.jobNumber} (${job.productName})',
        diamondItems: job.diamondItems,
      );
      _materials.insert(0, outEntry);
    }
    notifyListeners();
  }

  // Remove auto Material OUT when a Job is deleted
  void removeJobDiamondOutward(String jobId) {
    _materials.removeWhere((m) => m.jobId == jobId && m.direction == 'OUTWARD');
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
