import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../config/theme.dart';

class TaskDetailsScreen extends ConsumerStatefulWidget {
  final int taskId;

  const TaskDetailsScreen({super.key, required this.taskId});

  @override
  ConsumerState<TaskDetailsScreen> createState() => _TaskDetailsScreenState();
}

class _TaskDetailsScreenState extends ConsumerState<TaskDetailsScreen> {
  int _selectedTab = 0; // 0 = Checklist, 1 = Client Info
  Timer? _taskTimer;
  int _elapsedSeconds = 1935; // 32 mins 15 secs
  bool _isTimerRunning = true;
  bool _isActionLoading = false;

  // Checklist items state
  late List<Map<String, dynamic>> _checklistItems;

  @override
  void initState() {
    super.initState();
    _checklistItems = [
      {'title': 'Introduce yourself to client', 'completed': true},
      {'title': 'Assist with morning hygiene', 'completed': true},
      {'title': 'Support with dressing', 'completed': true},
      {'title': 'Meal preparation', 'completed': false},
      {'title': 'Record observations', 'completed': false},
    ];
    _startTimer();
  }

  void _startTimer() {
    _taskTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isTimerRunning && mounted) {
        setState(() => _elapsedSeconds++);
      }
    });
  }

  void _toggleTimer() {
    setState(() => _isTimerRunning = !_isTimerRunning);
  }

  String _formatTimer(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;
    return '${hours.toString().padLeft(1, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _toggleChecklistItem(int index) {
    setState(() {
      _checklistItems[index]['completed'] = !_checklistItems[index]['completed'];
    });
  }

  Future<void> _handleCompleteTask() async {
    setState(() => _isActionLoading = true);
    final ok = await ref.read(taskProvider.notifier).completeTask(widget.taskId);
    setState(() => _isActionLoading = false);

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Task Completed & Attendance Logged!'),
            ],
          ),
          backgroundColor: const Color(0xFF00A389),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      context.go('/home');
    }
  }

  @override
  void dispose() {
    _taskTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasksAsync = ref.watch(taskProvider);
    final isDark = AppTheme.isDark(context);

    final task = tasksAsync.value?.firstWhere(
      (t) => t.id == widget.taskId,
      orElse: () => TaskModel(
        id: widget.taskId,
        name: 'Personal Care Assistance',
        location: 'Riverside Care Home',
        workLocation: 'Room 101',
        shift: 'Morning Shift',
        category: 'Nursing',
        status: 'in_progress',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        companyName: 'Beacon Fire Safety',
        qrCode: 'AURA-WL-GLEN-01',
      ),
    );

    final completedCount = _checklistItems.where((i) => i['completed'] == true).length;
    final totalCount = _checklistItems.length;
    final progressPct = totalCount > 0 ? (completedCount / totalCount) : 0.0;

    return Scaffold(
      backgroundColor: AppTheme.bg(context),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF00A389),
        foregroundColor: Colors.white,
        title: const Text('Task Details', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Task Card
            Container(
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
                      Expanded(
                        child: Text(
                          task?.name ?? 'Personal Care Assistance',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? const Color(0xFF991B1B) : const Color(0xFFFECACA)),
                        ),
                        child: Text(
                          'High',
                          style: TextStyle(
                            color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFFEF4444),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.person_outline_rounded, size: 15, color: AppTheme.subtext(context)),
                      const SizedBox(width: 6),
                      Text(
                        'Mrs. Smith',
                        style: TextStyle(
                          color: isDark ? const Color(0xFF99F6E4) : const Color(0xFF334155),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 15, color: AppTheme.subtext(context)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '${task?.workLocation ?? 'Room 101'} · ${task?.location ?? 'Riverside Care Home'}',
                          style: TextStyle(color: AppTheme.subtext(context), fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 15, color: AppTheme.subtext(context)),
                      const SizedBox(width: 6),
                      Text(
                        '${task?.startTime ?? '10:00 AM'} – ${task?.endTime ?? '11:00 AM'} (1 hr)',
                        style: TextStyle(color: AppTheme.subtext(context), fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tab Selector: Checklist vs Client Info
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.slate800 : const Color(0xFFE2E8F0).withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: _selectedTab == 0
                              ? (isDark ? const Color(0xFF00A389) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: _selectedTab == 0
                              ? [BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 4, offset: const Offset(0, 1))]
                              : null,
                        ),
                        child: Text(
                          'Checklist',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: _selectedTab == 0
                                ? (isDark ? Colors.white : const Color(0xFF00A389))
                                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = 1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: _selectedTab == 1
                              ? (isDark ? const Color(0xFF00A389) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: _selectedTab == 1
                              ? [BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 4, offset: const Offset(0, 1))]
                              : null,
                        ),
                        child: Text(
                          'Client Info',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: _selectedTab == 1
                                ? (isDark ? Colors.white : const Color(0xFF00A389))
                                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (_selectedTab == 0) ...[
              // Progress Card
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
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Progress', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.text(context))),
                        Text(
                          '$completedCount of $totalCount completed   ${(progressPct * 100).toInt()}%',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF00A389)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: progressPct,
                        backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00A389)),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Checklist Items
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.cardBg(context),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.border(context)),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _checklistItems.length,
                  separatorBuilder: (_, __) => Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
                  itemBuilder: (context, index) {
                    final item = _checklistItems[index];
                    final isChecked = item['completed'] == true;

                    return InkWell(
                      onTap: () => _toggleChecklistItem(index),
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                color: isChecked ? const Color(0xFF00A389) : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isChecked ? const Color(0xFF00A389) : (isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1)),
                                  width: 2,
                                ),
                              ),
                              child: isChecked
                                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                                  : null,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                item['title'],
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isChecked
                                      ? (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))
                                      : AppTheme.text(context),
                                  decoration: isChecked ? TextDecoration.lineThrough : TextDecoration.none,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Task Timer Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF064E43) : const Color(0xFFE6F6F4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? const Color(0xFF0D7E6B) : const Color(0xFFB2E5DF)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timelapse_rounded, color: Color(0xFF00A389), size: 22),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Task Timer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? const Color(0xFF99F6E4) : const Color(0xFF064E43))),
                        Text(
                          _formatTimer(_elapsedSeconds),
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: isDark ? Colors.white : const Color(0xFF064E43), letterSpacing: 0.5),
                        ),
                      ],
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: _toggleTimer,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: Color(0xFF00A389),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _isTimerRunning ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Client Info Tab Content
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.cardBg(context),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('RESIDENT CARE NOTES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.subtext(context))),
                    const SizedBox(height: 10),
                    _clientInfoRow('Full Name', 'Mrs. Eleanor Smith', isDark),
                    _clientInfoRow('Care Level', 'Level 3 Aged Care Support', isDark),
                    _clientInfoRow('Dietary Needs', 'Low Sodium, Diabetic Friendly', isDark),
                    _clientInfoRow('Emergency Contact', 'James Smith (Son) - 0412 345 678', isDark),
                    _clientInfoRow('Primary Physician', 'Dr. Robert Taylor (St. Vincent Hospital)', isDark),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
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
          child: Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/qr-scan/${widget.taskId}'),
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                    label: const Text('Scan QR'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF00A389),
                      side: const BorderSide(color: Color(0xFF00A389), width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _isActionLoading ? null : _handleCompleteTask,
                    icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                    label: const Text('Complete Task'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00A389),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _clientInfoRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF1E293B), fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
