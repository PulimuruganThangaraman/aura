import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/task_provider.dart';
import '../../models/task.dart';
import '../../widgets/custom_drawer.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _filters = ['Day', 'Week', 'Month'];
  int _selectedFilter = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _selectedFilter = _tabController.index);
        ref.read(taskProvider.notifier).load(
              filter: _filters[_tabController.index].toLowerCase(),
            );
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(taskProvider.notifier).load(filter: 'day');
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasksAsync = ref.watch(taskProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      drawer: const CustomDrawer(currentRoute: '/home'),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A56DB),
        foregroundColor: Colors.white,
        title: const Text('My Tasks', style: TextStyle(fontWeight: FontWeight.w700)),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.go('/notifications'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: _filters.map((f) => Tab(text: f)).toList(),
        ),
      ),
      body: tasksAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Color(0xFF1A56DB)),
        ),
        error: (e, _) => _errorState(e.toString()),
        data: (tasks) => tasks.isEmpty
            ? _emptyState()
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: tasks.length,
                itemBuilder: (_, i) => TaskCard(task: tasks[i]),
              ),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.task_alt_rounded, size: 72, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            'No tasks assigned',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 6),
          Text(
            'Check Notifications for new assignments',
            style: TextStyle(color: Colors.grey.shade400, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _errorState(String msg) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text('Could not load tasks', style: TextStyle(color: Colors.grey.shade700)),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => ref.read(taskProvider.notifier).load(
                  filter: _filters[_selectedFilter].toLowerCase(),
                ),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A56DB),
              minimumSize: const Size(120, 42),
            ),
          ),
        ],
      ),
    );
  }
}

class TaskCard extends ConsumerStatefulWidget {
  final TaskModel task;

  const TaskCard({super.key, required this.task});

  @override
  ConsumerState<TaskCard> createState() => _TaskCardState();
}

class _TaskCardState extends ConsumerState<TaskCard> {
  bool _expanded = false;

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed': return const Color(0xFF10B981);
      case 'in_progress': return const Color(0xFF0EA5E9);
      case 'accepted': return const Color(0xFF1A56DB);
      case 'declined': return const Color(0xFFEF4444);
      default: return const Color(0xFFF59E0B);
    }
  }

  bool _canStart() {
    if (widget.task.startTime == null) return true;
    final now = TimeOfDay.now();
    final parts = widget.task.startTime!.split(':');
    if (parts.length < 2) return true;
    final taskHour = int.tryParse(parts[0]) ?? 0;
    final taskMin = int.tryParse(parts[1]) ?? 0;
    return now.hour > taskHour ||
        (now.hour == taskHour && now.minute >= taskMin);
  }

  @override
  Widget build(BuildContext context) {
    final task = widget.task;
    final statusColor = _statusColor(task.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Task header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        task.name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        task.status.replaceAll('_', ' ').toUpperCase(),
                        style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _infoRow(Icons.category_outlined, task.category),
                const SizedBox(height: 6),
                _infoRow(Icons.location_on_outlined, '${task.location} – ${task.workLocation}'),
                const SizedBox(height: 6),
                _infoRow(Icons.access_time_rounded, '${task.startTime ?? '--'} – ${task.endTime ?? '--'}'),
                if (task.scheduledDate != null) ...[
                  const SizedBox(height: 6),
                  _infoRow(Icons.calendar_today_outlined, task.scheduledDate!),
                ],
                const SizedBox(height: 14),
                // Action buttons
                Row(
                  children: [
                    if (task.status == 'accepted') ...[
                      Expanded(
                        child: SizedBox(
                          height: 42,
                          child: ElevatedButton.icon(
                            onPressed: _canStart()
                                ? () => context.go('/qr-scan/${task.id}')
                                : () => _showTimeWarning(context),
                            icon: const Icon(Icons.qr_code_scanner, size: 18),
                            label: const Text('Start Task'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1A56DB),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ),
                      ),
                    ],
                    if (task.status == 'in_progress') ...[
                      Expanded(
                        child: SizedBox(
                          height: 42,
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              final ok = await ref.read(taskProvider.notifier).completeTask(task.id);
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(ok ? 'Task completed!' : 'Failed to complete'),
                                  backgroundColor: ok ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            },
                            icon: const Icon(Icons.check_circle_outline, size: 18),
                            label: const Text('Complete'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ),
                      ),
                    ],
                    if (task.subtasks.isNotEmpty) ...[
                      const SizedBox(width: 10),
                      IconButton(
                        onPressed: () => setState(() => _expanded = !_expanded),
                        icon: AnimatedRotation(
                          turns: _expanded ? 0.5 : 0,
                          duration: const Duration(milliseconds: 250),
                          child: const Icon(Icons.keyboard_arrow_down_rounded,
                              color: Color(0xFF64748B)),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          // Expandable subtasks
          AnimatedSize(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            child: _expanded
                ? Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(16),
                        bottomRight: Radius.circular(16),
                      ),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Subtasks',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF475569),
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 10),
                        ...task.subtasks.map((s) => _SubtaskRow(subtask: s)),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  void _showTimeWarning(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Task can only be started at ${widget.task.startTime}.',
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        backgroundColor: const Color(0xFFF59E0B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 15, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _SubtaskRow extends StatelessWidget {
  final SubtaskModel subtask;

  const _SubtaskRow({required this.subtask});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: subtask.isCompleted ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subtask.name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF0F172A),
                    decoration: subtask.isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                if (subtask.startTime != null) ...[
                  const SizedBox(height: 3),
                  Text(
                    '${subtask.startTime} – ${subtask.endTime ?? '--'}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
