class NotificationModel {
  final int id;
  final String title;
  final String message;
  final String type;
  final int? taskId;
  final String? taskName;
  final String? category;
  final String? location;
  final String? scheduledDate;
  final String? startTime;
  final String? endTime;
  final bool isRead;
  final String createdAt;
  final String status; // pending, accepted, declined

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.taskId,
    this.taskName,
    this.category,
    this.location,
    this.scheduledDate,
    this.startTime,
    this.endTime,
    required this.isRead,
    required this.createdAt,
    this.status = 'pending',
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    message: json['message'] ?? '',
    type: json['type'] ?? 'task_assigned',
    taskId: json['task_id'],
    taskName: json['task_name'],
    category: json['category'],
    location: json['location'],
    scheduledDate: json['scheduled_date'],
    startTime: json['start_time'],
    endTime: json['end_time'],
    isRead: json['is_read'] ?? false,
    createdAt: json['created_at'] ?? '',
    status: json['status'] ?? 'pending',
  );
}
