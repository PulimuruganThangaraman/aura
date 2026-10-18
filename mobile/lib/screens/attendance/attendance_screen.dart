import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/attendance_provider.dart';
import '../../widgets/custom_drawer.dart';
import '../../config/theme.dart';

class AttendanceScreen extends ConsumerStatefulWidget {
  const AttendanceScreen({super.key});

  @override
  ConsumerState<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends ConsumerState<AttendanceScreen> {
  int _selectedFilter = 1; // 0 = Today, 1 = This Week, 2 = This Month
  final List<String> _filters = ['Today', 'This Week', 'This Month'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(attendanceProvider.notifier).load(filter: 'week');
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDark(context);

    return Scaffold(
      backgroundColor: AppTheme.bg(context),
      drawer: const CustomDrawer(currentRoute: '/attendance'),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF00A389),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text('Attendance', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Filter Switcher Tabs
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.slate800 : const Color(0xFFE2E8F0).withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: List.generate(_filters.length, (i) {
                  final isSelected = _selectedFilter == i;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedFilter = i);
                        ref.read(attendanceProvider.notifier).load(
                              filter: i == 0 ? 'today' : i == 1 ? 'week' : 'month',
                            );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark ? const Color(0xFF00A389) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: isSelected
                              ? [BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 4, offset: const Offset(0, 1))]
                              : null,
                        ),
                        child: Text(
                          _filters[i],
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: isSelected
                                ? (isDark ? Colors.white : const Color(0xFF00A389))
                                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Payable Hours Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardBg(context),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.border(context)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Payable Hours (${_filters[_selectedFilter]})',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.text(context)),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _statCol('5', 'Shifts Worked', isDark ? Colors.white : const Color(0xFF0F172A), isDark),
                      _verticalDivider(isDark),
                      _statCol('38.5', 'Gross Hours', isDark ? Colors.white : const Color(0xFF0F172A), isDark),
                      _verticalDivider(isDark),
                      _statCol('2.5', 'Break Hours', isDark ? Colors.white : const Color(0xFF0F172A), isDark),
                      _verticalDivider(isDark),
                      _statCol('36.0', 'Net Hours', const Color(0xFF00A389), isDark),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 3. Today's Attendance Timeline Card
            Text(
              "Today's Attendance",
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.cardBg(context),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.border(context)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Step 1: Clock In
                  _timelineItem(
                    iconColor: const Color(0xFF10B981),
                    title: 'Clock In',
                    time: '09:02 AM',
                    location: 'Riverside Care Home',
                    subtext: 'GPS: -33.8688, 151.2093',
                    isLast: false,
                    isDark: isDark,
                  ),
                  // Step 2: Meal Break
                  _timelineItem(
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Meal Break',
                    time: '12:30 PM – 01:00 PM',
                    location: '30m (Unpaid)',
                    subtext: null,
                    isLast: false,
                    isDark: isDark,
                  ),
                  // Step 3: Clock Out
                  _timelineItem(
                    iconColor: const Color(0xFF3B82F6),
                    title: 'Clock Out',
                    time: '05:05 PM',
                    location: 'Riverside Care Home',
                    subtext: 'GPS: -33.8688, 151.2093',
                    isLast: true,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 4. View Full History Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00A389),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('View Full History', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context, 2, isDark),
    );
  }

  Widget _statCol(String value, String label, Color valueColor, bool isDark) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: valueColor)),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              fontWeight: FontWeight.w600,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _verticalDivider(bool isDark) {
    return Container(width: 1, height: 32, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0));
  }

  Widget _timelineItem({
    required Color iconColor,
    required String title,
    required String time,
    required String location,
    String? subtext,
    required bool isLast,
    required bool isDark,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: iconColor,
                shape: BoxShape.circle,
                border: Border.all(color: isDark ? const Color(0xFF1E293B) : Colors.white, width: 2),
                boxShadow: [
                  BoxShadow(color: iconColor.withValues(alpha: 0.4), blurRadius: 4),
                ],
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 48,
                color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    time,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                location,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (subtext != null) ...[
                const SizedBox(height: 1),
                Text(
                  subtext,
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                  ),
                ),
              ],
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
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
