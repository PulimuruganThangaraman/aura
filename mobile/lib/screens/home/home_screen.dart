import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../providers/task_provider.dart';
import '../../models/task.dart';
import '../../services/gps_service.dart';
import '../../widgets/custom_drawer.dart';
import '../../config/theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _timeframeFilters = ['Today', 'This Week', 'All (24)'];
  int _selectedTimeframe = 0;
  String _selectedCategory = 'All';
  final List<String> _categoryFilters = ['All', 'Nursing', 'Disability', 'Hygiene'];
  
  final TextEditingController _searchCtrl = TextEditingController();
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _timeframeFilters.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _selectedTimeframe = _tabController.index);
        _applyFilters();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _acquireLocationAndLoad();
    });
  }

  Future<void> _acquireLocationAndLoad() async {
    try {
      final pos = await GpsService.getCurrentPosition();
      if (mounted) setState(() => _currentPosition = pos);
    } catch (_) {}
    _applyFilters();
  }

  void _applyFilters() {
    String filterParam = 'day';
    if (_selectedTimeframe == 1) filterParam = 'week';
    if (_selectedTimeframe == 2) filterParam = 'all';

    ref.read(taskProvider.notifier).load(
          filter: filterParam,
          search: _searchCtrl.text.trim().isEmpty ? null : _searchCtrl.text.trim(),
          userLat: _currentPosition?.latitude,
          userLng: _currentPosition?.longitude,
        );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasksAsync = ref.watch(taskProvider);
    final isDark = AppTheme.isDark(context);

    return Scaffold(
      backgroundColor: AppTheme.bg(context),
      drawer: const CustomDrawer(currentRoute: '/home'),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF00A389),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('My Tasks', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
            Text('Manage your assigned tasks', style: TextStyle(color: Colors.white70, fontSize: 11)),
          ],
        ),
      ),
      body: Column(
        children: [
          // 1. Timeframe Tabs: Today | This Week | All (24)
          Container(
            color: isDark ? AppTheme.slate800 : Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.slate900 : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: List.generate(_timeframeFilters.length, (i) {
                  final isSelected = _selectedTimeframe == i;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedTimeframe = i);
                        _tabController.animateTo(i);
                        _applyFilters();
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF00A389) : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: isSelected
                              ? [BoxShadow(color: const Color(0xFF00A389).withValues(alpha: 0.25), blurRadius: 4, offset: const Offset(0, 1))]
                              : null,
                        ),
                        child: Text(
                          _timeframeFilters[i],
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),

          // 2. Search & Category Filter Chips
          Container(
            color: isDark ? AppTheme.slate800 : Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: Column(
              children: [
                // Search Input
                Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.slate900 : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? const Color(0xFF334155) : Colors.transparent),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    onSubmitted: (_) => _applyFilters(),
                    style: TextStyle(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      hintText: 'Search tasks, clients or location...',
                      hintStyle: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                      prefixIcon: Icon(Icons.search_rounded, size: 18, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.close_rounded, size: 16, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                              onPressed: () {
                                _searchCtrl.clear();
                                _applyFilters();
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Category Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _categoryFilters.map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF00A389)
                                : (isDark ? AppTheme.slate900 : const Color(0xFFF1F5F9)),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF00A389)
                                  : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            ),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569)),
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // 3. Task List
          Expanded(
            child: tasksAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00A389))),
              error: (e, _) => Center(child: Text('Error loading tasks: $e')),
              data: (tasks) {
                // Static demo tasks matching exact mockup if tasks is empty
                final displayTasks = tasks.isNotEmpty
                    ? tasks
                    : [
                        TaskModel(
                          id: 1,
                          name: 'Personal Care Assistance',
                          location: 'Riverside Home',
                          workLocation: 'Room 101 - Mrs. Smith',
                          shift: 'Morning Shift',
                          category: 'Nursing',
                          status: 'in_progress',
                          startTime: '10:00 AM',
                          endTime: '11:00 AM',
                          isInRange: true,
                          distanceMeters: 120,
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
                          isInRange: false,
                          distanceMeters: 450,
                        ),
                        TaskModel(
                          id: 3,
                          name: 'Housekeeping Support',
                          location: 'Riverside Home',
                          workLocation: 'Common Area',
                          shift: 'Day Shift',
                          category: 'Hygiene',
                          status: 'yettostart',
                          startTime: '12:30 PM',
                          endTime: '01:30 PM',
                          isInRange: true,
                          distanceMeters: 80,
                        ),
                        TaskModel(
                          id: 4,
                          name: 'Social Engagement',
                          location: 'Riverside Home',
                          workLocation: 'Mrs. Wilson',
                          shift: 'Afternoon Shift',
                          category: 'Disability',
                          status: 'yettostart',
                          startTime: '02:00 PM',
                          endTime: '03:00 PM',
                        ),
                      ];

                return RefreshIndicator(
                  onRefresh: () async {
                    await _acquireLocationAndLoad();
                  },
                  color: const Color(0xFF00A389),
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                    itemCount: displayTasks.length,
                    itemBuilder: (context, index) {
                      final t = displayTasks[index];
                      return _buildTaskCard(t, index, context);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context, 1, isDark),
    );
  }

  Widget _buildTaskCard(TaskModel t, int index, BuildContext context) {
    final isDark = AppTheme.isDark(context);

    // Priorities based on index to match mockup
    String priorityLabel = 'Normal';
    Color priorityBg = isDark ? const Color(0xFF064E43) : const Color(0xFFE6F6F4);
    Color priorityText = isDark ? const Color(0xFF2DD4BF) : const Color(0xFF00A389);
    String progressStr = '3/5';

    if (index == 0) {
      priorityLabel = 'High';
      priorityBg = isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEE2E2);
      priorityText = isDark ? const Color(0xFFFCA5A5) : const Color(0xFFEF4444);
      progressStr = '3/5';
    } else if (index == 1) {
      priorityLabel = 'Normal';
      priorityBg = isDark ? const Color(0xFF0C4A6E) : const Color(0xFFE0F2FE);
      priorityText = isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7);
      progressStr = '0/4';
    } else if (index == 2) {
      priorityLabel = 'Low';
      priorityBg = isDark ? const Color(0xFF14532D) : const Color(0xFFDCFCE7);
      priorityText = isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A);
      progressStr = '0/6';
    }

    final isInZone = t.isInRange || (t.distanceMeters != null && t.distanceMeters! <= 200);

    return GestureDetector(
      onTap: () => context.go('/task-detail/${t.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
            // Top Row: Title + Priority Tag
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    t.name,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: priorityBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    priorityLabel,
                    style: TextStyle(color: priorityText, fontSize: 10, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),

            // Location / Client
            Text(
              t.workLocation.isNotEmpty ? t.workLocation : '${t.location} · Room 101',
              style: TextStyle(fontSize: 12, color: AppTheme.subtext(context), fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),

            // Time & Subtask Progress Row
            Row(
              children: [
                Icon(Icons.access_time_rounded, size: 13, color: AppTheme.subtext(context)),
                const SizedBox(width: 5),
                Text(
                  '${t.startTime ?? '10:00 AM'} – ${t.endTime ?? '11:00 AM'}',
                  style: TextStyle(fontSize: 12, color: AppTheme.subtext(context)),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.slate700 : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    progressStr,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : const Color(0xFF475569),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Proximity & Geofence Indicator Badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isInZone
                        ? (isDark ? const Color(0xFF064E43) : const Color(0xFFECFDF5))
                        : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFFF1F2)),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isInZone
                          ? (isDark ? const Color(0xFF0D7E6B) : const Color(0xFFA7F3D0))
                          : (isDark ? const Color(0xFF991B1B) : const Color(0xFFFECDD3)),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isInZone ? Icons.near_me_rounded : Icons.location_on_rounded,
                        size: 13,
                        color: isInZone
                            ? (isDark ? const Color(0xFF34D399) : const Color(0xFF059669))
                            : (isDark ? const Color(0xFFFCA5A5) : const Color(0xFFE11D48)),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isInZone ? 'In Check-in Zone' : '450m Away',
                        style: TextStyle(
                          color: isInZone
                              ? (isDark ? const Color(0xFF34D399) : const Color(0xFF059669))
                              : (isDark ? const Color(0xFFFCA5A5) : const Color(0xFFE11D48)),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (t.distanceMeters != null)
                  Row(
                    children: [
                      Icon(Icons.directions_walk_rounded, size: 13, color: AppTheme.subtext(context)),
                      const SizedBox(width: 2),
                      Text(
                        '${t.distanceMeters}m',
                        style: TextStyle(fontSize: 11, color: AppTheme.subtext(context), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
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
