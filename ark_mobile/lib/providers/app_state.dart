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
  bool hasLoadedOnce = false;

  // Fully Dynamic Lists loaded from PostgreSQL (Empty by default on fresh database)
  List<MaterialEntry> _materials = [];
  List<Manufacturer> _manufacturers = [];
  List<InventoryItem> _inventory = [];
  List<JobEntry> _jobs = [];

  AppState() {
    initLiveData();
  }

  Future<void> initLiveData() async {
    isSyncing = true;
    notifyListeners();

    try {
      final remoteMaterials = await ApiService.fetchMaterials();
      _materials = remoteMaterials;

      final remoteMfg = await ApiService.fetchManufacturers();
      _manufacturers = remoteMfg;

      final remoteJobs = await ApiService.fetchJobs();
      _jobs = remoteJobs;

      final remoteInv = await ApiService.fetchInventory();
      _inventory = remoteInv;

      hasLoadedOnce = true;
    } catch (e) {
      debugPrint('Sync failed: $e');
    } finally {
      isSyncing = false;
      notifyListeners();
    }
  }

  List<MaterialEntry> get materials => _materials;
  List<Manufacturer> get manufacturers => _manufacturers;
  List<InventoryItem> get inventory => _inventory;
  List<JobEntry> get jobs => _jobs;

  // --- DIAMOND INVENTORY EXACT MATCHING ENGINE ---

  // Get available carats for an exact (sizeMm, shape)
  double getAvailableDiamondStock(double sizeMm, String shape, [String? customShape]) {
    final shapeKey = shape == 'Other' ? (customShape ?? 'Other') : shape;
    final sizeKey = double.parse(sizeMm.toStringAsFixed(1));

    double received = 0.0;
    double issued = 0.0;

    for (final mat in _materials) {
      if (mat.materialType == 'diamond') {
        for (final d in mat.diamondItems) {
          final dSize = double.parse(d.sizeMm.toStringAsFixed(1));
          final dShape = d.effectiveShape;

          if (dSize == sizeKey && dShape.toLowerCase() == shapeKey.toLowerCase()) {
            if (mat.direction == 'INWARD') {
              received += d.weightCt;
            } else if (mat.direction == 'OUTWARD') {
              issued += d.weightCt;
            }
          }
        }
      }
    }

    final balance = received - issued;
    return balance > 0 ? balance : 0.0;
  }

  // Live aggregate diamond stock map
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

  // Material Mutations
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

  // Job Mutations
  void addJob(JobEntry job) {
    _jobs.insert(0, job);
    recordJobMaterialOutward(job);
    notifyListeners();
    ApiService.createJob(job);
  }

  void updateJob(JobEntry job) {
    final index = _jobs.indexWhere((j) => j.id == job.id);
    if (index != -1) {
      _jobs[index] = job;
      recordJobMaterialOutward(job);
      notifyListeners();
      ApiService.createJob(job);
    }
  }

  // Manufacturer Mutations
  void addManufacturer(Manufacturer mfg) {
    _manufacturers.add(mfg);
    notifyListeners();
    ApiService.createManufacturer(mfg);
  }

  // Automatically record linked Material OUT for Gold & Diamonds when a Job is created/edited
  void recordJobMaterialOutward(JobEntry job) {
    // 1. Remove previous auto-outward if editing
    _materials.removeWhere((m) => m.id == 'auto-out-diamond-${job.id}' || m.id == 'auto-out-gold-${job.id}' || m.id == 'auto-out-${job.id}');

    // 2. Insert Gold OUTWARD entry if job has goldWeight > 0
    if (job.goldWeight > 0) {
      final goldOutEntry = MaterialEntry(
        id: 'auto-out-gold-${job.id}',
        timestamp: job.timestamp,
        direction: 'OUTWARD',
        materialType: 'gold',
        weight: job.goldWeight,
        purity: job.goldPurity,
        vendorName: job.manufacturerName,
        manufacturerId: job.manufacturerId,
        price: 0,
        totalAmount: 0,
        productType: job.productName,
        photoUrl: job.photoUrl,
        notes: 'Auto Gold OUT for Job #${job.jobNumber} (${job.productName})',
      );
      _materials.insert(0, goldOutEntry);
    }

    // 3. Insert Diamond OUTWARD entry if job has diamond items
    if (job.diamondItems.isNotEmpty) {
      final double totalWeight = job.diamondItems.fold(0.0, (s, d) => s + d.weightCt);
      final diamondOutEntry = MaterialEntry(
        id: 'auto-out-diamond-${job.id}',
        timestamp: job.timestamp,
        direction: 'OUTWARD',
        materialType: 'diamond',
        weight: totalWeight,
        vendorName: job.manufacturerName.isNotEmpty ? job.manufacturerName : 'Auto Issued from Vault',
        manufacturerId: job.manufacturerId,
        price: 45000,
        totalAmount: totalWeight * 45000,
        productType: job.productName,
        photoUrl: job.photoUrl,
        diamondItems: job.diamondItems,
        notes: 'Auto Material OUT for Job #${job.jobNumber} (${job.productName})',
      );
      _materials.insert(0, diamondOutEntry);
    }

    notifyListeners();
  }

  void recordJobDiamondOutward(JobEntry job) => recordJobMaterialOutward(job);

  // Inventory Mutations
  void addInventoryItem(InventoryItem item) {
    _inventory.insert(0, item);
    notifyListeners();
  }
}
