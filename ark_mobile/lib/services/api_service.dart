import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/material_entry.dart';

class ApiService {
  static const String cloudApi = 'https://ark-z9mw.onrender.com/api';
  static const String localApi = 'http://localhost:5000/api';

  static Future<List<MaterialEntry>> fetchMaterials() async {
    try {
      final res = await http.get(Uri.parse('$cloudApi/materials'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final List list = data['materials'] ?? [];
        return list.map((m) => MaterialEntry(
          id: m['id'] ?? 'tx-${DateTime.now().millisecondsSinceEpoch}',
          timestamp: m['timestamp'] ?? DateTime.now().toString(),
          direction: m['direction'] ?? 'INWARD',
          materialType: m['material_type'] ?? m['materialType'] ?? 'gold',
          weight: (m['weight'] as num).toDouble(),
          purity: m['purity'],
          size: m['size'],
          vendorName: m['vendor_name'] ?? m['vendorName'] ?? 'General Supplier',
          manufacturerId: m['manufacturer_id'] ?? m['manufacturerId'],
          price: (m['price'] as num).toDouble(),
          totalAmount: (m['total_amount'] ?? m['totalAmount'] ?? 0).toDouble(),
          productType: m['product_type'] ?? m['productType'],
          photoUrl: m['photo_url'] ?? m['photoUrl'],
        )).toList();
      }
    } catch (e) {
      print('Cloud fetch failed: $e');
    }
    return [];
  }

  static Future<bool> createMaterial(MaterialEntry entry) async {
    try {
      final res = await http.post(
        Uri.parse('$cloudApi/materials'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
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
        }),
      );
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (e) {
      print('Create material failed: $e');
      return false;
    }
  }

  static Future<List<Manufacturer>> fetchManufacturers() async {
    try {
      final res = await http.get(Uri.parse('$cloudApi/manufacturers'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final List list = data['manufacturers'] ?? [];
        return list.map((m) => Manufacturer(
          id: m['id'] ?? 'mfg-${DateTime.now().millisecondsSinceEpoch}',
          name: m['name'] ?? '',
          office: m['office'] ?? '',
          photoUrl: m['photo_url'] ?? m['photoUrl'] ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
          jobsDone: m['jobs_done'] ?? m['jobsDone'] ?? 0,
          jobsOngoing: m['jobs_ongoing'] ?? m['jobsOngoing'] ?? 0,
          goldRemaining: (m['gold_remaining'] ?? m['goldRemaining'] ?? 0).toDouble(),
          makingCharge: (m['making_charge'] ?? m['makingCharge'] ?? 450).toDouble(),
        )).toList();
      }
    } catch (e) {
      print('Fetch manufacturers failed: $e');
    }
    return [];
  }
}
