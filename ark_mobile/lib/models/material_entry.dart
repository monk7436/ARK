class MaterialEntry {
  final String id;
  final String materialType; // gold, diamond, gemstone
  final String direction;    // INWARD, OUTWARD
  final double weight;
  final String? purity;
  final String? size;
  final String? manufacturerId;
  final String? productType;
  final String vendorName;
  final double price;
  final double totalAmount;
  final String timestamp;
  final String? photoUrl;
  final String? notes;

  MaterialEntry({
    required this.id,
    required this.materialType,
    required this.direction,
    required this.weight,
    this.purity,
    this.size,
    this.manufacturerId,
    this.productType,
    required this.vendorName,
    required this.price,
    required this.totalAmount,
    required this.timestamp,
    this.photoUrl,
    this.notes,
  });

  factory MaterialEntry.fromJson(Map<String, dynamic> json) {
    return MaterialEntry(
      id: json['_id'] ?? json['id'] ?? '',
      materialType: json['material_type'] ?? json['materialType'] ?? 'gold',
      direction: json['direction'] ?? 'INWARD',
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      purity: json['purity'],
      size: json['size'],
      manufacturerId: json['manufacturer_id'] ?? json['manufacturerId'],
      productType: json['product_type'] ?? json['productType'],
      vendorName: json['vendor_name'] ?? json['vendorName'] ?? 'Unknown Vendor',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      timestamp: json['timestamp'] ?? json['created_at'] ?? '',
      photoUrl: json['photo_url'] ?? json['photoUrl'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'material_type': materialType,
      'direction': direction,
      'weight': weight,
      'purity': purity,
      'size': size,
      'manufacturer_id': manufacturerId,
      'product_type': productType,
      'vendor_name': vendorName,
      'price': price,
      'total_amount': totalAmount,
      'timestamp': timestamp,
      'photo_url': photoUrl,
      'notes': notes,
    };
  }
}

class Manufacturer {
  final String id;
  final String name;
  final String office;
  final String photoUrl;
  final int jobsDone;
  final int jobsOngoing;
  final double goldRemaining;
  final double makingCharge;

  Manufacturer({
    required this.id,
    required this.name,
    required this.office,
    required this.photoUrl,
    required this.jobsDone,
    required this.jobsOngoing,
    required this.goldRemaining,
    required this.makingCharge,
  });
}

class InventoryItem {
  final String id;
  final String tagCode;
  final String name;
  final String category;
  final String purityKarat;
  final double grossWeight;
  final double stoneWeight;
  final double netWeight;
  final double fineWeight;
  final double makingCharge;
  final String status;
  final String photoUrl;

  InventoryItem({
    required this.id,
    required this.tagCode,
    required this.name,
    required this.category,
    required this.purityKarat,
    required this.grossWeight,
    required this.stoneWeight,
    required this.netWeight,
    required this.fineWeight,
    required this.makingCharge,
    required this.status,
    required this.photoUrl,
  });
}
