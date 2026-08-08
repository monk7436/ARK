import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/material_entry.dart';

class ApiService {
  static const String localApi = 'http://localhost:5000/api';
  static const String cloudApi = 'https://ark-z9mw.onrender.com/api';

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  // Generic request with local -> cloud fallback
  static Future<http.Response?> _request(String path, {String method = 'GET', Map<String, dynamic>? body}) async {
    final headers = {'Content-Type': 'application/json'};
    final encodedBody = body != null ? json.encode(body) : null;

    // 1. Try local server
    try {
      final uri = Uri.parse('$localApi$path');
      http.Response res;
      if (method == 'POST') {
        res = await http.post(uri, headers: headers, body: encodedBody).timeout(const Duration(seconds: 4));
      } else if (method == 'PUT') {
        res = await http.put(uri, headers: headers, body: encodedBody).timeout(const Duration(seconds: 4));
      } else if (method == 'DELETE') {
        res = await http.delete(uri).timeout(const Duration(seconds: 4));
      } else {
        res = await http.get(uri).timeout(const Duration(seconds: 4));
      }
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res;
      }
    } catch (_) {
      // Continue to cloud
    }

    // 2. Try cloud server
    try {
      final uri = Uri.parse('$cloudApi$path');
      http.Response res;
      if (method == 'POST') {
        res = await http.post(uri, headers: headers, body: encodedBody).timeout(const Duration(seconds: 8));
      } else if (method == 'PUT') {
        res = await http.put(uri, headers: headers, body: encodedBody).timeout(const Duration(seconds: 8));
      } else if (method == 'DELETE') {
        res = await http.delete(uri).timeout(const Duration(seconds: 8));
      } else {
        res = await http.get(uri).timeout(const Duration(seconds: 8));
      }
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res;
      }
    } catch (_) {
      // Offline fallback
    }

    return null;
  }

  // --- MATERIALS ---
  static Future<List<MaterialEntry>> fetchMaterials() async {
    final res = await _request('/materials');
    if (res != null) {
      try {
        final data = json.decode(res.body);
        final List list = data['materials'] ?? [];
        return list.map((m) {
          final List dList = m['diamond_items'] ?? m['diamondItems'] ?? [];
          final List gList = m['gemstone_items'] ?? m['gemstoneItems'] ?? [];

          return MaterialEntry(
            id: m['id']?.toString() ?? 'tx-${DateTime.now().millisecondsSinceEpoch}',
            timestamp: m['timestamp']?.toString() ?? DateTime.now().toString(),
            direction: m['direction']?.toString() ?? 'INWARD',
            materialType: m['material_type']?.toString() ?? m['materialType']?.toString() ?? 'gold',
            weight: _parseDouble(m['weight'] ?? m['gold_weight']),
            purity: m['purity']?.toString(),
            size: m['size']?.toString(),
            vendorName: m['vendor_name']?.toString() ?? m['vendorName']?.toString() ?? 'General Supplier',
            manufacturerId: m['manufacturer_id']?.toString() ?? m['manufacturerId']?.toString(),
            price: _parseDouble(m['price']),
            totalAmount: _parseDouble(m['total_amount'] ?? m['totalAmount']),
            productType: m['product_type']?.toString() ?? m['productType']?.toString(),
            photoUrl: m['photo_url']?.toString() ?? m['photoUrl']?.toString(),
            diamondItems: dList.map((d) => DiamondItem(
              id: d['id']?.toString() ?? '',
              parentId: d['material_entry_id']?.toString() ?? d['parentId']?.toString(),
              weightCt: _parseDouble(d['weight_ct'] ?? d['weight']),
              sizeMm: _parseDouble(d['size_mm'] ?? d['size'] ?? 2.5),
              shape: d['shape']?.toString() ?? 'Round',
              customShape: d['custom_shape']?.toString() ?? d['customShape']?.toString(),
            )).toList(),
            gemstoneItems: gList.map((g) => GemstoneItem(
              id: g['id']?.toString() ?? '',
              parentId: g['material_entry_id']?.toString() ?? g['parentId']?.toString(),
              weight: _parseDouble(g['weight']),
              size: g['size']?.toString() ?? 'Standard',
              stoneType: g['stone_type']?.toString() ?? g['stoneType']?.toString() ?? 'Gemstone',
            )).toList(),
          );
        }).toList();
      } catch (e) {
        debugPrint('Error parsing materials: $e');
      }
    }
    return [];
  }

  static Future<bool> createMaterial(MaterialEntry entry) async {
    final res = await _request('/materials', method: 'POST', body: {
      'id': entry.id,
      'direction': entry.direction,
      'materialType': entry.materialType,
      'weight': entry.weight,
      'purity': entry.purity,
      'size': entry.size,
      'vendorName': entry.vendorName,
      'manufacturerId': entry.manufacturerId,
      'price': entry.price,
      'totalAmount': entry.totalAmount,
      'productType': entry.productType,
      'photoUrl': entry.photoUrl,
      'diamondItems': entry.diamondItems.map((d) => {
        'id': d.id,
        'weightCt': d.weightCt,
        'sizeMm': d.sizeMm,
        'shape': d.shape,
        'customShape': d.customShape
      }).toList(),
      'gemstoneItems': entry.gemstoneItems.map((g) => {
        'id': g.id,
        'weight': g.weight,
        'size': g.size,
        'stoneType': g.stoneType
      }).toList()
    });
    return res != null;
  }

  // --- JOBS ---
  static Future<List<JobEntry>> fetchJobs() async {
    final res = await _request('/jobs');
    if (res != null) {
      try {
        final data = json.decode(res.body);
        final List list = data['jobs'] ?? [];
        return list.map((j) {
          final List dList = j['diamond_items'] ?? j['diamondItems'] ?? [];
          final List gList = j['gemstone_items'] ?? j['gemstoneItems'] ?? [];
          final List<String> pList = j['photos'] is List ? (j['photos'] as List).map((e) => e.toString()).toList() : [];

          return JobEntry(
            id: j['id']?.toString() ?? 'job-${DateTime.now().millisecondsSinceEpoch}',
            jobNumber: j['job_number']?.toString() ?? j['jobNumber']?.toString() ?? '001',
            timestamp: j['timestamp']?.toString() ?? DateTime.now().toString(),
            manufacturerId: j['manufacturer_id']?.toString() ?? j['manufacturerId']?.toString() ?? '',
            manufacturerName: j['manufacturer_name']?.toString() ?? j['manufacturerName']?.toString() ?? 'Artisan Workshop',
            productName: j['product_name']?.toString() ?? j['productName']?.toString() ?? 'Custom Jewellery',
            goldWeight: _parseDouble(j['gold_weight'] ?? j['goldWeight']),
            goldPurity: j['gold_purity']?.toString() ?? j['goldPurity']?.toString() ?? '24K',
            diamondItems: dList.map((d) => DiamondItem(
              id: d['id']?.toString() ?? '',
              parentId: d['job_id']?.toString() ?? d['parentId']?.toString(),
              weightCt: _parseDouble(d['weight_ct'] ?? d['weight']),
              sizeMm: _parseDouble(d['size_mm'] ?? d['size'] ?? 2.5),
              shape: d['shape']?.toString() ?? 'Round',
              customShape: d['custom_shape']?.toString() ?? d['customShape']?.toString(),
            )).toList(),
            gemstoneItems: gList.map((g) => GemstoneItem(
              id: g['id']?.toString() ?? '',
              parentId: g['job_id']?.toString() ?? g['parentId']?.toString(),
              weight: _parseDouble(g['weight']),
              size: g['size']?.toString() ?? 'Standard',
              stoneType: g['stone_type']?.toString() ?? g['stoneType']?.toString() ?? 'Gemstone',
            )).toList(),
            notes: j['notes']?.toString() ?? '',
            photoUrl: j['photo_url']?.toString() ?? j['photoUrl']?.toString(),
            photos: pList,
            status: j['status']?.toString() ?? 'In Progress',
          );
        }).toList();
      } catch (e) {
        debugPrint('Error parsing jobs: $e');
      }
    }
    return [];
  }

  static Future<bool> createJob(JobEntry job) async {
    final res = await _request('/jobs', method: 'POST', body: {
      'id': job.id,
      'jobNumber': job.jobNumber,
      'timestamp': job.timestamp,
      'manufacturerId': job.manufacturerId,
      'manufacturerName': job.manufacturerName,
      'productName': job.productName,
      'goldWeight': job.goldWeight,
      'goldPurity': job.goldPurity,
      'notes': job.notes,
      'photoUrl': job.photoUrl,
      'photos': job.photos,
      'diamondItems': job.diamondItems.map((d) => {
        'id': d.id,
        'weightCt': d.weightCt,
        'sizeMm': d.sizeMm,
        'shape': d.shape,
        'customShape': d.customShape
      }).toList(),
      'gemstoneItems': job.gemstoneItems.map((g) => {
        'id': g.id,
        'weight': g.weight,
        'size': g.size,
        'stoneType': g.stoneType
      }).toList()
    });
    return res != null;
  }

  // --- MANUFACTURERS ---
  static Future<List<Manufacturer>> fetchManufacturers() async {
    final res = await _request('/manufacturers');
    if (res != null) {
      try {
        final data = json.decode(res.body);
        final List list = data['manufacturers'] ?? [];
        return list.map((m) => Manufacturer(
          id: m['id']?.toString() ?? 'mfg-${DateTime.now().millisecondsSinceEpoch}',
          name: m['name']?.toString() ?? '',
          office: m['office']?.toString() ?? '',
          photoUrl: m['photo_url']?.toString() ?? m['photoUrl']?.toString() ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
          jobsDone: int.tryParse(m['jobs_done']?.toString() ?? m['jobsDone']?.toString() ?? '0') ?? 0,
          jobsOngoing: int.tryParse(m['jobs_ongoing']?.toString() ?? m['jobsOngoing']?.toString() ?? '0') ?? 0,
          goldRemaining: _parseDouble(m['gold_remaining'] ?? m['goldRemaining']),
          makingCharge: _parseDouble(m['making_charge'] ?? m['makingCharge'] ?? 450),
        )).toList();
      } catch (e) {
        debugPrint('Error parsing manufacturers: $e');
      }
    }
    return [];
  }

  static Future<bool> createManufacturer(Manufacturer mfg) async {
    final res = await _request('/manufacturers', method: 'POST', body: {
      'name': mfg.name,
      'office': mfg.office,
      'photoUrl': mfg.photoUrl,
      'makingCharge': mfg.makingCharge
    });
    return res != null;
  }

  // --- INVENTORY ---
  static Future<List<InventoryItem>> fetchInventory() async {
    final res = await _request('/inventory');
    if (res != null) {
      try {
        final data = json.decode(res.body);
        final List list = data['inventory'] ?? [];
        return list.map((i) => InventoryItem(
          id: i['id']?.toString() ?? 'inv-${DateTime.now().millisecondsSinceEpoch}',
          tagCode: i['tag_code']?.toString() ?? i['tagCode']?.toString() ?? 'ARK-TAG-000',
          name: i['name']?.toString() ?? '',
          category: i['category']?.toString() ?? 'Ring',
          purityKarat: i['purity_karat']?.toString() ?? i['purityKarat']?.toString() ?? '22K (91.6%)',
          grossWeight: _parseDouble(i['gross_weight'] ?? i['grossWeight']),
          stoneWeight: _parseDouble(i['stone_weight'] ?? i['stoneWeight']),
          netWeight: _parseDouble(i['net_weight'] ?? i['netWeight']),
          fineWeight: _parseDouble(i['fine_weight'] ?? i['fineWeight']),
          makingCharge: _parseDouble(i['making_charge'] ?? i['makingCharge']),
          status: i['status']?.toString() ?? 'IN_STOCK',
          photoUrl: i['photo_url']?.toString() ?? i['photoUrl']?.toString() ?? 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
        )).toList();
      } catch (e) {
        debugPrint('Error parsing inventory: $e');
      }
    }
    return [];
  }
}
