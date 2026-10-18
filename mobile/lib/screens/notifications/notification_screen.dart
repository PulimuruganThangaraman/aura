import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  String _selectedCategory = 'All';
  final List<String> _categories = ['All', 'Shifts', 'Tasks', 'System'];

  final List<Map<String, dynamic>> _mockNotifs = const [
    {
      'title': 'Upcoming Shift',
      'body': 'Your shift starts in 15 minutes\nRiverside Care Home',
      'time': '5m ago',
      'category': 'Shifts',
      'icon': Icons.schedule_rounded,
      'color': Color(0xFF2563EB),
      'bgColor': Color(0xFFEFF6FF),
    },
    {
      'title': 'Task Assigned',
      'body': 'Personal Care Assistance\nToday 10:00 AM',
      'time': '2h ago',
      'category': 'Tasks',
      'icon': Icons.notifications_active_rounded,
      'color': Color(0xFFEF4444),
      'bgColor': Color(0xFFFEE2E2),
    },
    {
      'title': 'Shift Reminder',
      'body': 'Please check-in at the location',
      'time': '1d ago',
      'category': 'Shifts',
      'icon': Icons.notifications_none_rounded,
      'color': Color(0xFFEA580C),
      'bgColor': Color(0xFFFFF7ED),
    },
    {
      'title': 'Compliance Update',
      'body': 'Your NDIS document has been verified',
      'time': '2d ago',
      'category': 'System',
      'icon': Icons.verified_user_rounded,
      'color': Color(0xFF059669),
      'bgColor': Color(0xFFECFDF5),
    },
    {
      'title': 'New Message',
      'body': 'Message from your coordinator',
      'time': '2d ago',
      'category': 'System',
      'icon': Icons.chat_bubble_outline_rounded,
      'color': Color(0xFF0284C7),
      'bgColor': Color(0xFFE0F2FE),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDark(context);
    final filteredList = _selectedCategory == 'All'
        ? _mockNotifs
        : _mockNotifs.where((n) => n['category'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppTheme.bg(context),
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.slate900 : const Color(0xFF00A389),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
      ),
      body: Column(
        children: [
          // Category Filter Chips
          Container(
            color: isDark ? AppTheme.slate800 : Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
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

          // Notifications List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredList.length,
              itemBuilder: (context, index) {
                final notif = filteredList[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? (notif['color'] as Color).withValues(alpha: 0.2) : notif['bgColor'],
                          shape: BoxShape.circle,
                        ),
                        child: Icon(notif['icon'], color: notif['color'], size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  notif['title'],
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.text(context)),
                                ),
                                Text(
                                  notif['time'],
                                  style: TextStyle(fontSize: 10, color: AppTheme.subtext(context), fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              notif['body'],
                              style: TextStyle(fontSize: 12, color: AppTheme.subtext(context), height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
