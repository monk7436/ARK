import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/material_entry.dart';
import '../theme/app_theme.dart';

class AddManufacturerModal extends StatefulWidget {
  final Function(Manufacturer) onSubmit;

  const AddManufacturerModal({super.key, required this.onSubmit});

  @override
  State<AddManufacturerModal> createState() => _AddManufacturerModalState();
}

class _AddManufacturerModalState extends State<AddManufacturerModal> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _officeCtrl = TextEditingController();
  final _makingChargeCtrl = TextEditingController(text: '450');
  final _notesCtrl = TextEditingController();

  final List<String> _photosBase64 = [];
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _mobileCtrl.dispose();
    _officeCtrl.dispose();
    _makingChargeCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  void _showAttachmentBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Attach Profile Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.camera);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.camera_alt_outlined, color: AppTheme.goldDark, size: 28),
                          SizedBox(height: 8),
                          Text('Take Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.gallery);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.photo_library_outlined, color: Color(0xFF2563EB), size: 28),
                          SizedBox(height: 8),
                          Text('Choose Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.camera) {
        final XFile? image = await _picker.pickImage(source: source, imageQuality: 70);
        if (image != null) {
          final bytes = await image.readAsBytes();
          setState(() {
            if (_photosBase64.length < 3) {
              _photosBase64.add('data:image/jpeg;base64,${base64Encode(bytes)}');
            }
          });
        }
      } else {
        final List<XFile> images = await _picker.pickMultiImage(imageQuality: 70);
        for (var img in images) {
          if (_photosBase64.length >= 3) break;
          final bytes = await img.readAsBytes();
          _photosBase64.add('data:image/jpeg;base64,${base64Encode(bytes)}');
        }
        setState(() {});
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // Do NOT auto-fill a fake/random image. If empty, photoUrl is empty so initials avatar is displayed.
      final newMfg = Manufacturer(
        id: 'mfg-${DateTime.now().millisecondsSinceEpoch}',
        name: _nameCtrl.text.trim(),
        office: _officeCtrl.text.trim(),
        photoUrl: _photosBase64.isNotEmpty ? _photosBase64.first : '',
        jobsDone: 0,
        jobsOngoing: 0,
        goldRemaining: 0.000,
        makingCharge: double.tryParse(_makingChargeCtrl.text) ?? 450.0,
      );

      widget.onSubmit(newMfg);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 440),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('KARIGAR REGISTRATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF9333EA))),
                        Text('Add New Manufacturer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 14),

                // Name *
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'MANUFACTURER NAME *', hintText: 'e.g. Soni & Sons Goldsmiths'),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Name is required' : null,
                ),

                const SizedBox(height: 10),

                // Mobile
                TextFormField(
                  controller: _mobileCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'MOBILE NUMBER (OPTIONAL)', hintText: '+91 98765 43210'),
                ),

                const SizedBox(height: 10),

                // Office Location *
                TextFormField(
                  controller: _officeCtrl,
                  decoration: const InputDecoration(labelText: 'OFFICE / WORKSHOP LOCATION *', hintText: 'e.g. Blue Diamond Complex / Surat Hub'),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Location is required' : null,
                ),

                const SizedBox(height: 10),

                // Default Making Charge
                TextFormField(
                  controller: _makingChargeCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'DEFAULT MAKING CHARGE (₹ / GRAM)', hintText: '450'),
                ),

                const SizedBox(height: 10),

                // Notes
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'NOTES (OPTIONAL)', hintText: 'Specialization, terms...'),
                ),

                const SizedBox(height: 12),

                // Attachments Header & Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PROFILE PHOTO (OPTIONAL) (${_photosBase64.length}/3)', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    if (_photosBase64.length < 3)
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          side: const BorderSide(color: Color(0xFFD97706)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        icon: const Icon(Icons.add_a_photo_outlined, size: 14, color: Color(0xFFD97706)),
                        label: const Text('+ Add Photo', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                        onPressed: _showAttachmentBottomSheet,
                      ),
                  ],
                ),

                if (_photosBase64.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _photosBase64.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final base64Img = entry.value;
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              base64Decode(base64Img.split(',').last),
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -4,
                            right: -4,
                            child: InkWell(
                              onTap: () => setState(() => _photosBase64.removeAt(idx)),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(color: Color(0xFFDC2626), shape: BoxShape.circle),
                                child: const Icon(Icons.close, size: 12, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 18),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    onPressed: _submit,
                    child: const Text('CREATE MANUFACTURER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ),

              ],
            ),
          ),
        ),
      ),
    );
  }
}
