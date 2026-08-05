import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/material_entry.dart';

class ApiService {
  static const String cloudApi = 'https://ark-z9mw.onrender.com/api';
  static const String localApi = 'http://localhost:5000/api';

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  static Future<List<MaterialEntry>> fetchMaterials() async {
    try {
      final res = await http.get(Uri.parse('$cloudApi/materials'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final List list = data['materials'] ?? [];
        return list.map((m) => MaterialEntry(
          id: m['id']?.toString() ?? 'tx-${DateTime.now().millisecondsSinceEpoch}',
          timestamp: m['timestamp']?.toString() ?? DateTime.now().toString(),
          direction: m['direction']?.toString() ?? 'INWARD',
          materialType: m['material_type']?.toString() ?? m['materialType']?.toString() ?? 'gold',
          weight: _parseDouble(m['weight']),
          purity: m['purity']?.toString(),
          size: m['size']?.toString(),
          vendorName: m['vendor_name']?.toString() ?? m['vendorName']?.toString() ?? 'General Supplier',
          manufacturerId: m['manufacturer_id']?.toString() ?? m['manufacturerId']?.toString(),
          price: _parseDouble(m['price']),
          totalAmount: _parseDouble(m['total_amount'] ?? m['totalAmount']),
          productType: m['product_type']?.toString() ?? m['productType']?.toString(),
          photoUrl: m['photo_url']?.toString() ?? m['photoUrl']?.toString(),
        )).toList();
      }
    } catch (e) {
      print('Cloud fetch materials failed: $e');
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
          id: m['id']?.toString() ?? 'mfg-${DateTime.now().millisecondsSinceEpoch}',
          name: m['name']?.toString() ?? '',
          office: m['office']?.toString() ?? '',
          photoUrl: m['photo_url']?.toString() ?? m['photoUrl']?.toString() ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
          jobsDone: int.tryParse(m['jobs_done']?.toString() ?? m['jobsDone']?.toString() ?? '0') ?? 0,
          jobsOngoing: int.tryParse(m['jobs_ongoing']?.toString() ?? m['jobsOngoing']?.toString() ?? '0') ?? 0,
          goldRemaining: _parseDouble(m['gold_remaining'] ?? m['goldRemaining']),
          makingCharge: _parseDouble(m['making_charge'] ?? m['makingCharge'] ?? 450),
        )).toList();
      }
    } catch (e) {
      print('Fetch manufacturers failed: $e');
    }
    return [];
  }
}
