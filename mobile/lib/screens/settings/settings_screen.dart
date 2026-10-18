import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/attendance_provider.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../widgets/custom_drawer.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFFF8FAFC),
      drawer: const CustomDrawer(currentRoute: '/settings'),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF00A389),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionLabel('Appearance', isDark),
          _card(
            isDark: isDark,
            children: [
              _switchTile(
                icon: isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                label: 'Dark Mode',
                subtitle: isDark ? 'Dark theme is on' : 'Light theme is on',
                value: isDark,
                isDark: isDark,
                onChanged: (v) => ref.read(themeModeProvider.notifier).state = v,
              ),
            ],
          ),
          const SizedBox(height: 16),

          _sectionLabel('Notifications', isDark),
          _card(
            isDark: isDark,
            children: [
              _switchTile(
                icon: Icons.notifications_active_rounded,
                label: 'Push Notifications',
                subtitle: 'Task assignments and shift reminders',
                value: true,
                isDark: isDark,
                onChanged: (_) {},
              ),
              Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
              _switchTile(
                icon: Icons.alarm_rounded,
                label: 'Task Reminders',
                subtitle: '15 minutes before task start',
                value: true,
                isDark: isDark,
                onChanged: (_) {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          _sectionLabel('About', isDark),
          _card(
            isDark: isDark,
            children: [
              _infoTile(Icons.info_outline_rounded, 'App Version', AppConfig.version, isDark),
              Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
              _infoTile(Icons.shield_outlined, 'Privacy Policy', 'View policy →', isDark),
              Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
              _infoTile(Icons.help_outline_rounded, 'Help & Support', 'Contact support →', isDark),
              Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
              _infoTile(Icons.business_rounded, 'About AuraLinks', 'Enterprise Workforce Platform', isDark),
            ],
          ),
          const SizedBox(height: 28),

          Center(
            child: Text(
              '© 2026 AuraLinks. All rights reserved.',
              style: TextStyle(color: isDark ? const Color(0xFF64748B) : Colors.grey.shade500, fontSize: 12),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: isDark ? const Color(0xFF2DD4BF) : const Color(0xFF64748B),
          fontSize: 12,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _card({required List<Widget> children, required bool isDark}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.slate800 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _switchTile({
    required IconData icon,
    required String label,
    required String subtitle,
    required bool value,
    required bool isDark,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: const Color(0xFF00A389).withValues(alpha: isDark ? 0.25 : 0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: isDark ? const Color(0xFF2DD4BF) : const Color(0xFF00A389), size: 20),
      ),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 14,
          color: isDark ? Colors.white : const Color(0xFF0F172A),
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          fontSize: 12,
          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
        ),
      ),
      trailing: Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeTrackColor: const Color(0xFF00A389),
        activeThumbColor: Colors.white,
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value, bool isDark) {
    return ListTile(
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: (isDark ? Colors.white : const Color(0xFF64748B)).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), size: 20),
      ),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          color: isDark ? Colors.white : const Color(0xFF0F172A),
        ),
      ),
      trailing: Text(
        value,
        style: TextStyle(
          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
