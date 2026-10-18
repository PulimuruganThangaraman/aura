import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class CustomDrawer extends ConsumerWidget {
  final String currentRoute;

  const CustomDrawer({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Drawer(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // 1. Dark Teal Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF042F2C), Color(0xFF064E43), Color(0xFF0D7E6B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  topRight: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00A389).withOpacity(0.3),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.all_inclusive_rounded, color: Color(0xFF2DD4BF), size: 20),
                          ),
                          const SizedBox(width: 8),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'AuraLinks',
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                              ),
                              Text(
                                'Care Today. Better Tomorrow.',
                                style: TextStyle(color: Color(0xFF99F6E4), fontSize: 9, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                        onPressed: () => Navigator.pop(context),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // User Info Card in Drawer
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: const Color(0xFF00A389),
                        child: Text(
                          user?.firstName.isNotEmpty == true ? user!.firstName[0].toUpperCase() : 'A',
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.fullName.isNotEmpty == true ? user!.fullName : 'Arun Kumar',
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                            ),
                            Text(
                              user?.isAdmin == true ? 'Company Admin' : 'Care Professional',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                            const SizedBox(height: 3),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.3),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'NDIS Verified ✓',
                                style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // 2. Navigation Menu List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                children: [
                  _drawerItem(
                    icon: Icons.dashboard_rounded,
                    title: 'Dashboard',
                    route: '/dashboard',
                    isSelected: currentRoute == '/dashboard',
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.list_alt_rounded,
                    title: 'My Tasks',
                    route: '/home',
                    isSelected: currentRoute == '/home',
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.qr_code_scanner_rounded,
                    title: 'QR Scan',
                    route: '/qr-scan/0',
                    isSelected: currentRoute.startsWith('/qr-scan'),
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.history_rounded,
                    title: 'Attendance',
                    route: '/attendance',
                    isSelected: currentRoute == '/attendance',
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.notifications_none_rounded,
                    title: 'Notifications',
                    route: '/notifications',
                    isSelected: currentRoute == '/notifications',
                    context: context,
                    badgeCount: 3,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.checklist_rtl_rounded,
                    title: 'Checklist Library',
                    route: '/home',
                    isSelected: false,
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.person_outline_rounded,
                    title: 'Profile',
                    route: '/profile',
                    isSelected: currentRoute == '/profile',
                    context: context,
                    isDark: isDark,
                  ),
                  Divider(height: 16, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
                  _drawerItem(
                    icon: Icons.help_outline_rounded,
                    title: 'Help & Support',
                    route: '/profile',
                    isSelected: false,
                    context: context,
                    isDark: isDark,
                  ),
                  _drawerItem(
                    icon: Icons.settings_outlined,
                    title: 'Settings',
                    route: '/settings',
                    isSelected: currentRoute == '/settings',
                    context: context,
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            // 3. Logout action
            Padding(
              padding: const EdgeInsets.all(16),
              child: InkWell(
                onTap: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) context.go('/auth/landing');
                },
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  child: Row(
                    children: const [
                      Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                      SizedBox(width: 12),
                      Text(
                        'Logout',
                        style: TextStyle(color: Color(0xFFEF4444), fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem({
    required IconData icon,
    required String title,
    required String route,
    required bool isSelected,
    required BuildContext context,
    bool isDark = false,
    int? badgeCount,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 2),
      decoration: BoxDecoration(
        color: isSelected
            ? (isDark ? const Color(0xFF00A389).withOpacity(0.25) : const Color(0xFFE6F6F4))
            : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        dense: true,
        leading: Icon(
          icon,
          color: isSelected
              ? (isDark ? const Color(0xFF2DD4BF) : const Color(0xFF00A389))
              : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          size: 20,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected
                ? (isDark ? const Color(0xFF2DD4BF) : const Color(0xFF00A389))
                : (isDark ? const Color(0xFFE2E8F0) : const Color(0xFF334155)),
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            fontSize: 13,
          ),
        ),
        trailing: badgeCount != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$badgeCount',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                ),
              )
            : null,
        onTap: () {
          Navigator.pop(context);
          context.go(route);
        },
      ),
    );
  }
}
