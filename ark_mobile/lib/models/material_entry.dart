class MaterialEntry {
  final String id;
  final String timestamp;
  final String direction; // INWARD or OUTWARD
  final String materialType; // gold, diamond, gemstone
  final double weight; // Grams for gold, Carats for diamond/gemstone
  final String? purity; // e.g. "995 (24K)"
  final String? size; // e.g. "2.5 mm"
  final String vendorName;
  final String? manufacturerId;
  final double price;
  final double totalAmount;
  final String? productType; // Ring, Necklace, Bangle, etc.
  final String? photoUrl;

  MaterialEntry({
    required this.id,
    required this.timestamp,
    required this.direction,
    required this.materialType,
    required this.weight,
    this.purity,
    this.size,
    required this.vendorName,
    this.manufacturerId,
    required this.price,
    required this.totalAmount,
    this.productType,
    this.photoUrl,
  });
}

class Manufacturer {
  final String id;
  final String name;
  final String office;
  final String photoUrl;
  final int jobsDone;
  final int jobsOngoing;
  final double goldRemaining; // 24K fine gold balance held in grams
  final double makingCharge; // Rate per gram

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
