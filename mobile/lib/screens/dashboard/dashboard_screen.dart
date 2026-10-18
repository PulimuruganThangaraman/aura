import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';
import '../../models/task.dart';
import '../../services/gps_service.dart';
import '../../widgets/custom_drawer.dart';
import '../../config/theme.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initData();
    });
  }

  Future<void> _initData() async {
    try {
      final pos = await GpsService.getCurrentPosition();
      if (mounted) setState(() => _currentPosition = pos);
    } catch (_) {}

    ref.read(taskProvider.notifier).load(
          filter: 'all',
          userLat: _currentPosition?.latitude,
          userLng: _currentPosition?.longitude,
        );
    ref.read(notificationProvider.notifier).load();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final tasksAsync = ref.watch(taskProvider);
    final notifsAsync = ref.watch(notificationProvider);
    final isDark = AppTheme.isDark(context);

    final unreadNotifs = notifsAsync.maybeWhen(
      data: (notifs) => notifs.where((n) => !n.isRead).length,
      orElse: () => 3,
    );

    return Scaffold(
      backgroundColor: AppTheme.bg(context),
      drawer: const CustomDrawer(currentRoute: '/dashboard'),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF064E43),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFF00A389),
              child: Text(
                user?.firstName.isNotEmpty == true ? user!.firstName[0].toUpperCase() : 'A',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'Good Morning, ${user?.firstName ?? 'Arun'}',
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          user?.isAdmin == true ? 'Company Admin' : 'Care Professional',
                          style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.6), width: 0.8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'NDIS Verified ✓',
                              style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () => context.go('/notifications'),
              ),
              if (unreadNotifs > 0)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEF4444),
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$unreadNotifs',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Current Shift Card
            _buildCurrentShiftCard(context),
            const SizedBox(height: 16),

            // 2. 4 KPI Grid Cards (Today's Tasks, In Progress, Completed, Payable Hours)
            _buildKpiGrid(tasksAsync, isDark),
            const SizedBox(height: 20),

            // 3. Quick Actions Grid
            Text(
              'Quick Actions',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
            ),
            const SizedBox(height: 10),
            _buildQuickActionsRow(context, isDark),
            const SizedBox(height: 22),

            // 4. Upcoming Tasks Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Upcoming Tasks',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
                ),
                GestureDetector(
                  onTap: () => context.go('/home'),
                  child: const Text(
                    'View All',
                    style: TextStyle(color: Color(0xFF00A389), fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _buildUpcomingTasksList(tasksAsync, context),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context, 0, isDark),
    );
  }

  Widget _buildCurrentShiftCard(BuildContext context) {
    final isDark = AppTheme.isDark(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBg(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Current Shift',
                style: TextStyle(color: AppTheme.subtext(context), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF064E43) : const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? const Color(0xFF0D7E6B) : const Color(0xFFA7F3D0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.circle, color: Color(0xFF10B981), size: 6),
                    const SizedBox(width: 4),
                    Text(
                      'In Progress',
                      style: TextStyle(
                        color: isDark ? const Color(0xFF34D399) : const Color(0xFF059669),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Aged Care Facility',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
          ),
          Text(
            'Riverside Care Home',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.subtext(context)),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(Icons.access_time_rounded, size: 14, color: AppTheme.subtext(context)),
              const SizedBox(width: 6),
              Text(
                '09:00 AM – 05:00 PM',
                style: TextStyle(color: AppTheme.subtext(context), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              const Text('2h 15m elapsed', style: TextStyle(color: Color(0xFF00A389), fontSize: 12, fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiGrid(AsyncValue<List<TaskModel>> tasksAsync, bool isDark) {
    int total = 3;
    int inProgress = 1;
    int completed = 2;

    tasksAsync.whenData((tasks) {
      if (tasks.isNotEmpty) {
        total = tasks.length;
        inProgress = tasks.where((t) => t.status == 'in_progress').length;
        completed = tasks.where((t) => t.status == 'completed').length;
      }
    });

    return Row(
      children: [
        Expanded(
          child: _kpiCard(
            count: '$total',
            label: "Today's Tasks",
            bgColor: const Color(0xFFEFF6FF),
            textColor: const Color(0xFF2563EB),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _kpiCard(
            count: '$inProgress',
            label: 'In Progress',
            bgColor: const Color(0xFFFFF7ED),
            textColor: const Color(0xFFEA580C),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _kpiCard(
            count: '$completed',
            label: 'Completed',
            bgColor: const Color(0xFFECFDF5),
            textColor: const Color(0xFF059669),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _kpiCard(
            count: '7.5',
            label: 'Payable Hours',
            bgColor: const Color(0xFFF1F5F9),
            textColor: const Color(0xFF475569),
            isDark: isDark,
          ),
        ),
      ],
    );
  }

  Widget _kpiCard({
    required String count,
    required String label,
    required Color bgColor,
    required Color textColor,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
      decoration: BoxDecoration(
        color: isDark ? textColor.withValues(alpha: 0.15) : bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: textColor.withValues(alpha: isDark ? 0.35 : 0.15)),
      ),
      child: Column(
        children: [
          Text(count, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: isDark ? Colors.white : textColor)),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isDark ? const Color(0xFF94A3B8) : textColor.withValues(alpha: 0.85),
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsRow(BuildContext context, bool isDark) {
    return Row(
      children: [
        _actionCircular(
          icon: Icons.qr_code_scanner_rounded,
          label: 'Scan QR',
          onTap: () => context.go('/qr-scan/0'),
          context: context,
        ),
        _actionCircular(
          icon: Icons.task_alt_rounded,
          label: 'My Tasks',
          onTap: () => context.go('/home'),
          context: context,
        ),
        _actionCircular(
          icon: Icons.history_rounded,
          label: 'Attendance',
          onTap: () => context.go('/attendance'),
          context: context,
        ),
        _actionCircular(
          icon: Icons.notifications_none_rounded,
          label: 'Notifications',
          onTap: () => context.go('/notifications'),
          context: context,
        ),
      ],
    );
  }

  Widget _actionCircular({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required BuildContext context,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: const Color(0xFF00A389),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: const Color(0xFF00A389).withValues(alpha: 0.25), blurRadius: 8, offset: const Offset(0, 3)),
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.text(context)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingTasksList(AsyncValue<List<TaskModel>> tasksAsync, BuildContext context) {
    final isDark = AppTheme.isDark(context);

    return tasksAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00A389))),
      error: (_, __) => const SizedBox.shrink(),
      data: (tasks) {
        final sampleTasks = tasks.isNotEmpty
            ? tasks.take(2).toList()
            : [
                TaskModel(
                  id: 1,
                  name: 'Personal Care Assistance',
                  location: 'Riverside Care Home',
                  workLocation: 'Room 101 - Mrs. Smith',
                  shift: 'Morning Shift',
                  category: 'Nursing',
                  status: 'in_progress',
                  startTime: '10:00 AM',
                  endTime: '11:00 AM',
                ),
                TaskModel(
                  id: 2,
                  name: 'Medication Support',
                  location: 'Riverside Home',
                  workLocation: 'Room 203 - Mr. Johnson',
                  shift: 'Day Shift',
                  category: 'Nursing',
                  status: 'yettostart',
                  startTime: '11:30 AM',
                  endTime: '12:30 PM',
                ),
              ];

        return Column(
          children: sampleTasks.asMap().entries.map((entry) {
            final idx = entry.key;
            final t = entry.value;
            final isHigh = idx == 0;

            return GestureDetector(
              onTap: () => context.go('/task-detail/${t.id}'),
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.cardBg(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border(context)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isHigh ? const Color(0xFFEF4444) : const Color(0xFF00A389),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  t.name,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppTheme.text(context),
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isHigh
                                      ? (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEE2E2))
                                      : (isDark ? const Color(0xFF064E43) : const Color(0xFFE6F6F4)),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  isHigh ? 'High' : 'Normal',
                                  style: TextStyle(
                                    color: isHigh
                                        ? (isDark ? const Color(0xFFFCA5A5) : const Color(0xFFEF4444))
                                        : (isDark ? const Color(0xFF2DD4BF) : const Color(0xFF00A389)),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            t.workLocation,
                            style: TextStyle(fontSize: 12, color: AppTheme.subtext(context), fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${t.startTime ?? '10:00 AM'} – ${t.endTime ?? '11:00 AM'}',
                            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context, int currentIndex, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.slate800 : Colors.white,
        border: Border(top: BorderSide(color: isDark ? const Color(0xFF334155) : Colors.grey.shade200)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          backgroundColor: isDark ? AppTheme.slate800 : Colors.white,
          selectedItemColor: const Color(0xFF00A389),
          unselectedItemColor: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          onTap: (index) {
            if (index == 0) context.go('/dashboard');
            if (index == 1) context.go('/home');
            if (index == 2) context.go('/attendance');
            if (index == 3) context.go('/profile');
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.task_alt_rounded), label: 'Tasks'),
            BottomNavigationBarItem(icon: Icon(Icons.history_rounded), label: 'Attendance'),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}
