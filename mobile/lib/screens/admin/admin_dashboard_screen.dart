import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/task_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/admin_stats.dart';
import '../../models/company.dart';
import '../../widgets/custom_drawer.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  int _selectedBottomNav = 0;

  final List<Map<String, dynamic>> _staffList = [
    {
      'name': 'Arun Kumar',
      'role': 'Aged Care',
      'status': 'On-Shift',
      'statusColor': Color(0xFF10B981),
      'statusBg': Color(0xFFD1FAE5),
    },
    {
      'name': 'Priya Shah',
      'role': 'Disability Support',
      'status': 'Available',
      'statusColor': Color(0xFF0284C7),
      'statusBg': Color(0xFFE0F2FE),
    },
    {
      'name': 'Michael Brown',
      'role': 'Maintenance',
      'status': 'Off-Duty',
      'statusColor': Color(0xFF64748B),
      'statusBg': Color(0xFFF1F5F9),
    },
    {
      'name': 'Lisa Chen',
      'role': 'Nursing',
      'status': 'On-Shift',
      'statusColor': Color(0xFF10B981),
      'statusBg': Color(0xFFD1FAE5),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final companiesAsync = ref.watch(companiesProvider);
    final selectedCompany = ref.watch(selectedCompanyFilterProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const CustomDrawer(currentRoute: '/admin'),
      appBar: AppBar(
        backgroundColor: const Color(0xFF064E43),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Row(
          children: [
            const CircleAvatar(
              radius: 17,
              backgroundColor: Color(0xFF00A389),
              child: Text('S', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Hello, Sarah Wilson', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('Super Admin', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () => context.go('/notifications'),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Company Filter Dropdown Container
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.business_rounded, color: Color(0xFF00A389), size: 18),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'All Companies (25)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF64748B), size: 18),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2. 4 Executive KPI Cards
            Row(
              children: [
                Expanded(
                  child: _kpiAdminCard(
                    icon: Icons.assignment_rounded,
                    count: '1,050',
                    label: 'Total Tasks',
                    color: const Color(0xFF2563EB),
                    bgColor: const Color(0xFFEFF6FF),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _kpiAdminCard(
                    icon: Icons.people_alt_rounded,
                    count: '260',
                    label: 'Field Staff',
                    color: const Color(0xFF059669),
                    bgColor: const Color(0xFFECFDF5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _kpiAdminCard(
                    icon: Icons.flash_on_rounded,
                    count: '198',
                    label: 'Active Jobs',
                    color: const Color(0xFFEA580C),
                    bgColor: const Color(0xFFFFF7ED),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _kpiAdminCard(
                    icon: Icons.verified_rounded,
                    count: '98.4%',
                    label: 'SLA Compliance',
                    color: const Color(0xFF7C3AED),
                    bgColor: const Color(0xFFF5F3FF),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // 3. Staff Status Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Staff Status',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                GestureDetector(
                  onTap: () {},
                  child: const Text(
                    'View All',
                    style: TextStyle(color: Color(0xFF00A389), fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Staff list items
            Column(
              children: _staffList.map((staff) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: const Color(0xFFF1F5F9),
                        child: Text(
                          staff['name'][0],
                          style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              staff['name'],
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                            ),
                            Text(
                              staff['role'],
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: staff['statusBg'],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.circle, color: staff['statusColor'], size: 6),
                            const SizedBox(width: 4),
                            Text(
                              staff['status'],
                              style: TextStyle(color: staff['statusColor'], fontSize: 10, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: SafeArea(
          child: BottomNavigationBar(
            currentIndex: _selectedBottomNav,
            backgroundColor: Colors.white,
            selectedItemColor: const Color(0xFF00A389),
            unselectedItemColor: const Color(0xFF94A3B8),
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            onTap: (i) => setState(() => _selectedBottomNav = i),
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
              BottomNavigationBarItem(icon: Icon(Icons.business_rounded), label: 'Companies'),
              BottomNavigationBarItem(icon: Icon(Icons.people_alt_rounded), label: 'Staff'),
              BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: 'Reports'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _kpiAdminCard({
    required IconData icon,
    required String count,
    required String label,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 1)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(count, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
