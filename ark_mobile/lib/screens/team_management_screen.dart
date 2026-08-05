import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class TeamMember {
  final String id;
  final String name;
  final String phone;
  final String role;
  final String access;
  final String avatar;

  TeamMember({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
    required this.access,
    required this.avatar,
  });
}

class TeamManagementScreen extends StatefulWidget {
  final String storeName;
  const TeamManagementScreen({super.key, this.storeName = 'Sahyadri Tower Store'});

  @override
  State<TeamManagementScreen> createState() => _TeamManagementScreenState();
}

class _TeamManagementScreenState extends State<TeamManagementScreen> {
  final List<TeamMember> _teamMembers = [
    TeamMember(id: 'tm-1', name: 'Rahul (You)', phone: '+91 98765 43210', role: 'Owner', access: 'Admin', avatar: 'R'),
    TeamMember(id: 'tm-2', name: 'Amit Sharma', phone: '+91 98111 22334', role: 'Counter Sales', access: 'Sales Access', avatar: 'A'),
    TeamMember(id: 'tm-3', name: 'Pooja Verma', phone: '+91 98222 33445', role: 'Vault Operator', access: 'Vault In/Out', avatar: 'P'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Team Management', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textMain)),
            Text('📍 ${widget.storeName}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textMain),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _teamMembers.length,
              itemBuilder: (context, index) {
                final member = _teamMembers[index];
                final isOwner = member.role == 'Owner';
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppTheme.borderSubtle)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isOwner ? AppTheme.goldPrimary : const Color(0xFF0F172A),
                      child: Text(member.avatar, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                    title: Text(member.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('📞 ${member.phone} • ${member.role}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isOwner ? const Color(0xFFDCFCE7) : const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        member.access,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isOwner ? const Color(0xFF15803D) : const Color(0xFF0369A1),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Bottom Action Panel: Add Contact / Add Manually
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2))],
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: AppTheme.goldDark),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _showAddFromContactsSheet(context),
                    icon: const Icon(Icons.contacts, color: AppTheme.goldDark, size: 20),
                    label: const Text('Add Contact', style: TextStyle(color: AppTheme.goldDark, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppTheme.goldPrimary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _showAddManualMemberSheet(context),
                    icon: const Icon(Icons.person_add, color: Colors.white, size: 20),
                    label: const Text('Add Manually', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAddManualMemberSheet(BuildContext context) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String role = 'Counter Sales';
    String access = 'Sales Access';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          top: 20, left: 20, right: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
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
                const Text('Add Member Manually', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'FULL NAME', hintText: 'e.g. Ramesh Shah'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'PHONE NUMBER', hintText: '+91 98765 43210'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: role,
              decoration: const InputDecoration(labelText: 'STORE ROLE'),
              items: const [
                DropdownMenuItem(value: 'Store Manager', child: Text('Store Manager')),
                DropdownMenuItem(value: 'Counter Sales', child: Text('Counter Sales')),
                DropdownMenuItem(value: 'Vault Operator', child: Text('Vault Operator')),
                DropdownMenuItem(value: 'Accountant', child: Text('Accountant')),
              ],
              onChanged: (val) => role = val!,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: access,
              decoration: const InputDecoration(labelText: 'ACCESS PERMISSION'),
              items: const [
                DropdownMenuItem(value: 'Sales Access', child: Text('Sales Access')),
                DropdownMenuItem(value: 'Vault In/Out', child: Text('Vault In/Out Access')),
                DropdownMenuItem(value: 'Full Access', child: Text('Full Manager Access')),
              ],
              onChanged: (val) => access = val!,
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.goldPrimary),
                onPressed: () {
                  if (nameCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                    setState(() {
                      _teamMembers.add(TeamMember(
                        id: 'tm-${DateTime.now().millisecondsSinceEpoch}',
                        name: nameCtrl.text,
                        phone: phoneCtrl.text,
                        role: role,
                        access: access,
                        avatar: nameCtrl.text.substring(0, 1).toUpperCase(),
                      ));
                    });
                    Navigator.pop(ctx);
                  }
                },
                child: const Text('ADD MEMBER TO STORE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddFromContactsSheet(BuildContext context) {
    final contacts = [
      {'name': 'Rohan Mehta', 'phone': '+91 98333 44556', 'role': 'Store Manager'},
      {'name': 'Suresh Patel', 'phone': '+91 98444 55667', 'role': 'Accountant'},
      {'name': 'Kavita Shah', 'phone': '+91 98555 66778', 'role': 'Vault Operator'},
    ];

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
                const Text('Select Contact', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 10),
            ...contacts.map((c) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(c['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(c['phone']!),
                trailing: Text('+ Add as ${c['role']}', style: const TextStyle(color: AppTheme.goldDark, fontWeight: FontWeight.bold, fontSize: 11)),
                onTap: () {
                  setState(() {
                    _teamMembers.add(TeamMember(
                      id: 'tm-${DateTime.now().millisecondsSinceEpoch}',
                      name: c['name']!,
                      phone: c['phone']!,
                      role: c['role']!,
                      access: 'Sales Access',
                      avatar: c['name']!.substring(0, 1),
                    ));
                  });
                  Navigator.pop(ctx);
                },
              ),
            )),
          ],
        ),
      ),
    );
  }
}
