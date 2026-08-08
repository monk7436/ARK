// Individual Structured Independent Child Diamond Record
class DiamondItem {
  final String id;
  final String? parentId; // Linked to parent Job ID or Material Entry ID
  final double weightCt;  // Carat (ct)
  final double sizeMm;    // 0.8 mm to 11.0 mm (0.1 mm step)
  final String shape;     // Round, Princess, Cushion, Oval, Pear, Marquise, Emerald, Radiant, Asscher, Heart, Baguette, Uncut, Other
  final String? customShape; // Specified if shape == 'Other'
  final double? rate;     // Optional Price per Carat

  DiamondItem({
    required this.id,
    this.parentId,
    required this.weightCt,
    required this.sizeMm,
    required this.shape,
    this.customShape,
    this.rate,
  });

  // Display category key (e.g. "2.5 mm Oval" or "3.0 mm Custom Cut")
  String get effectiveShape => shape == 'Other' ? (customShape ?? 'Other') : shape;
  String get sizeDisplay => '${sizeMm.toStringAsFixed(1)} mm';
  String get categoryKey => '${sizeMm.toStringAsFixed(1)} mm_$effectiveShape';
  String get displayName => '$sizeDisplay $effectiveShape';

  // Compatibility getter for weight
  double get weight => weightCt;
  String get size => sizeDisplay;

  factory DiamondItem.fromJson(Map<String, dynamic> json) {
    double parsedWeight = (json['weight_ct'] as num?)?.toDouble() ?? 
                         (json['weightCt'] as num?)?.toDouble() ?? 
                         (json['weight'] as num?)?.toDouble() ?? 0.0;
    
    double parsedSize = (json['size_mm'] as num?)?.toDouble() ?? 
                       (json['sizeMm'] as num?)?.toDouble() ?? 
                       double.tryParse(json['size']?.toString().replaceAll(' mm', '') ?? '') ?? 2.5;

    return DiamondItem(
      id: json['id']?.toString() ?? 'd-${DateTime.now().millisecondsSinceEpoch}',
      parentId: json['parent_id'] ?? json['parentId'],
      weightCt: parsedWeight,
      sizeMm: parsedSize,
      shape: json['shape']?.toString() ?? 'Round',
      customShape: json['custom_shape'] ?? json['customShape'],
      rate: (json['rate'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parent_id': parentId,
      'weight_ct': weightCt,
      'weight': weightCt,
      'size_mm': sizeMm,
      'size': sizeDisplay,
      'shape': shape,
      'custom_shape': customShape,
      'rate': rate,
    };
  }
}

// Individual Independent Child Gemstone Record
class GemstoneItem {
  final String id;
  final String? parentId; // Linked to parent Job ID or Material Entry ID
  final double weight;    // Carat (ct)
  final String size;      // e.g. "5x7 mm Oval", "4mm Round"
  final String? stoneType;// e.g. "Ruby", "Emerald", "Sapphire"
  final double? rate;     // Optional Price per Carat

  GemstoneItem({
    required this.id,
    this.parentId,
    required this.weight,
    required this.size,
    this.stoneType,
    this.rate,
  });

  factory GemstoneItem.fromJson(Map<String, dynamic> json) {
    return GemstoneItem(
      id: json['id']?.toString() ?? 'g-${DateTime.now().millisecondsSinceEpoch}',
      parentId: json['parent_id'] ?? json['parentId'],
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      size: json['size']?.toString() ?? 'Standard',
      stoneType: json['stone_type'] ?? json['stoneType'] ?? 'Gemstone',
      rate: (json['rate'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parent_id': parentId,
      'weight': weight,
      'size': size,
      'stone_type': stoneType,
      'rate': rate,
    };
  }
}

// Parent Material Entry with structured child diamond/gemstone stone items
class MaterialEntry {
  final String id;
  final String materialType; // gold, diamond, gemstone
  final String direction;    // INWARD, OUTWARD
  final double weight;
  final String? purity;
  final String? size;
  final String? manufacturerId;
  final String? jobId;
  final String? productType;
  final String vendorName;
  final double price;
  final double totalAmount;
  final String timestamp;
  final String? photoUrl;
  final String? notes;
  final List<DiamondItem> diamondItems;
  final List<GemstoneItem> gemstoneItems;

  MaterialEntry({
    required this.id,
    required this.materialType,
    required this.direction,
    required this.weight,
    this.purity,
    this.size,
    this.manufacturerId,
    this.jobId,
    this.productType,
    required this.vendorName,
    required this.price,
    required this.totalAmount,
    required this.timestamp,
    this.photoUrl,
    this.notes,
    this.diamondItems = const [],
    this.gemstoneItems = const [],
  });

  factory MaterialEntry.fromJson(Map<String, dynamic> json) {
    var dList = json['diamond_items'] ?? json['diamondItems'] as List<dynamic>?;
    var gList = json['gemstone_items'] ?? json['gemstoneItems'] as List<dynamic>?;

    return MaterialEntry(
      id: json['_id'] ?? json['id'] ?? '',
      materialType: json['material_type'] ?? json['materialType'] ?? 'gold',
      direction: json['direction'] ?? 'INWARD',
      weight: (json['weight'] as num?)?.toDouble() ?? (json['gold_weight'] as num?)?.toDouble() ?? 0.0,
      purity: json['purity'] ?? json['gold_purity'],
      size: json['size'],
      manufacturerId: json['manufacturer_id'] ?? json['manufacturerId'],
      jobId: json['job_id'] ?? json['jobId'],
      productType: json['product_type'] ?? json['productType'],
      vendorName: json['vendor_name'] ?? json['vendorName'] ?? 'Unknown Vendor',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      timestamp: json['timestamp'] ?? json['created_at'] ?? '',
      photoUrl: json['photo_url'] ?? json['photoUrl'],
      notes: json['notes'],
      diamondItems: dList != null ? dList.map((d) => DiamondItem.fromJson(d)).toList() : [],
      gemstoneItems: gList != null ? gList.map((g) => GemstoneItem.fromJson(g)).toList() : [],
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
      'job_id': jobId,
      'product_type': productType,
      'vendor_name': vendorName,
      'price': price,
      'total_amount': totalAmount,
      'timestamp': timestamp,
      'photo_url': photoUrl,
      'notes': notes,
      'diamond_items': diamondItems.map((d) => d.toJson()).toList(),
      'gemstone_items': gemstoneItems.map((g) => g.toJson()).toList(),
    };
  }
}

// Parent Manufacturing Job Entry with structured child diamond/gemstone items
class JobEntry {
  final String id;
  final String jobNumber;
  final String timestamp;
  final String? manufacturerId;
  final String manufacturerName;
  final String productName;
  final double goldWeight;
  final String goldPurity;
  final String status;
  final String? notes;
  final String? photoUrl;
  final List<String> photos;
  final List<DiamondItem> diamondItems;
  final List<GemstoneItem> gemstoneItems;

  JobEntry({
    required this.id,
    required this.jobNumber,
    required this.timestamp,
    this.manufacturerId,
    required this.manufacturerName,
    required this.productName,
    this.goldWeight = 0.0,
    this.goldPurity = '24K',
    this.status = 'In Progress',
    this.notes,
    this.photoUrl,
    this.photos = const [],
    this.diamondItems = const [],
    this.gemstoneItems = const [],
  });

  factory JobEntry.fromJson(Map<String, dynamic> json) {
    var dList = json['diamond_items'] ?? json['diamondItems'] as List<dynamic>?;
    var gList = json['gemstone_items'] ?? json['gemstoneItems'] as List<dynamic>?;
    var pList = json['photos'] as List<dynamic>?;

    return JobEntry(
      id: json['id'] ?? '',
      jobNumber: json['job_number'] ?? json['jobNumber'] ?? '001',
      timestamp: json['timestamp'] ?? '',
      manufacturerId: json['manufacturer_id'] ?? json['manufacturerId'],
      manufacturerName: json['manufacturer_name'] ?? json['manufacturerName'] ?? 'Artisan Workshop',
      productName: json['product_name'] ?? json['productName'] ?? 'Custom Jewellery Order',
      goldWeight: (json['gold_weight'] as num?)?.toDouble() ?? (json['goldWeight'] as num?)?.toDouble() ?? 0.0,
      goldPurity: json['gold_purity'] ?? json['goldPurity'] ?? '24K',
      status: json['status'] ?? 'In Progress',
      notes: json['notes'],
      photoUrl: json['photo_url'] ?? json['photoUrl'],
      photos: pList != null ? pList.map((p) => p.toString()).toList() : [],
      diamondItems: dList != null ? dList.map((d) => DiamondItem.fromJson(d)).toList() : [],
      gemstoneItems: gList != null ? gList.map((g) => GemstoneItem.fromJson(g)).toList() : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'job_number': jobNumber,
      'timestamp': timestamp,
      'manufacturer_id': manufacturerId,
      'manufacturer_name': manufacturerName,
      'product_name': productName,
      'gold_weight': goldWeight,
      'gold_purity': goldPurity,
      'status': status,
      'notes': notes,
      'photo_url': photoUrl,
      'photos': photos,
      'diamond_items': diamondItems.map((d) => d.toJson()).toList(),
      'gemstone_items': gemstoneItems.map((g) => g.toJson()).toList(),
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
