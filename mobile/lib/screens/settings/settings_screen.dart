import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/attendance_provider.dart';
import '../../config/app_config.dart';
import '../../widgets/custom_drawer.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      drawer: const CustomDrawer(currentRoute: '/settings'),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A56DB),
        foregroundColor: Colors.white,
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w700)),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionLabel('Appearance'),
          _card(children: [
            _switchTile(
              icon: Icons.dark_mode_rounded,
              label: 'Dark Mode',
              subtitle: isDark ? 'Dark theme is on' : 'Light theme is on',
              value: isDark,
              onChanged: (v) => ref.read(themeModeProvider.notifier).state = v,
            ),
          ]),
          const SizedBox(height: 16),
          _sectionLabel('Notifications'),
          _card(children: [
            _switchTile(
              icon: Icons.notifications_active_rounded,
              label: 'Push Notifications',
              subtitle: 'Task assignments and reminders',
              value: true,
              onChanged: (_) {},
            ),
            const Divider(height: 1),
            _switchTile(
              icon: Icons.alarm_rounded,
              label: 'Task Reminders',
              subtitle: '15 minutes before task start',
              value: true,
              onChanged: (_) {},
            ),
          ]),
          const SizedBox(height: 16),
          _sectionLabel('About'),
          _card(children: [
            _infoTile(Icons.info_outline_rounded, 'App Version', AppConfig.version),
            const Divider(height: 1),
            _infoTile(Icons.shield_outlined, 'Privacy Policy', 'View policy →'),
            const Divider(height: 1),
            _infoTile(Icons.help_outline_rounded, 'Help & Support', 'Contact support →'),
            const Divider(height: 1),
            _infoTile(Icons.business_rounded, 'About AuraLinks', 'Enterprise Workforce Platform'),
          ]),
          const SizedBox(height: 24),
          Center(
            child: Text(
              '© 2026 AuraLinks. All rights reserved.',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _card({required List<Widget> children}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(children: children),
    );
  }

  Widget _switchTile({
    required IconData icon,
    required String label,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: const Color(0xFF1A56DB).withOpacity(0.1),
          borderRadius: BorderRadius.circular(9),
        ),
        child: Icon(icon, color: const Color(0xFF1A56DB), size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      trailing: Switch.adaptive(value: value, onChanged: onChanged, activeColor: const Color(0xFF1A56DB)),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: const Color(0xFF64748B).withOpacity(0.08),
          borderRadius: BorderRadius.circular(9),
        ),
        child: Icon(icon, color: const Color(0xFF64748B), size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
      trailing: Text(value, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
    );
  }
}
