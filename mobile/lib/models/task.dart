class SubtaskModel {
  final int id;
  final String name;
  final String? startTime;
  final String? endTime;
  final String? instructions;
  final bool isCompleted;

  SubtaskModel({
    required this.id,
    required this.name,
    this.startTime,
    this.endTime,
    this.instructions,
    this.isCompleted = false,
  });

  factory SubtaskModel.fromJson(Map<String, dynamic> json) => SubtaskModel(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    startTime: json['start_time'],
    endTime: json['end_time'],
    instructions: json['instructions'],
    isCompleted: json['is_completed'] ?? false,
  );
}

class TaskModel {
  final int id;
  final String name;
  final String category;
  final String location;
  final String workLocation;
  final String shift;
  final String? scheduledDate;
  final String? startTime;
  final String? endTime;
  final String status; // pending, accepted, in_progress, completed, declined
  final String? qrCode;
  final double? latitude;
  final double? longitude;
  final List<SubtaskModel> subtasks;

  TaskModel({
    required this.id,
    required this.name,
    required this.category,
    required this.location,
    required this.workLocation,
    required this.shift,
    this.scheduledDate,
    this.startTime,
    this.endTime,
    required this.status,
    this.qrCode,
    this.latitude,
    this.longitude,
    this.subtasks = const [],
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) => TaskModel(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    category: json['category'] ?? '',
    location: json['location'] ?? '',
    workLocation: json['work_location'] ?? '',
    shift: json['shift'] ?? '',
    scheduledDate: json['scheduled_date'],
    startTime: json['start_time'],
    endTime: json['end_time'],
    status: json['status'] ?? 'pending',
    qrCode: json['qr_code'],
    latitude: json['latitude']?.toDouble(),
    longitude: json['longitude']?.toDouble(),
    subtasks: (json['subtasks'] as List<dynamic>? ?? [])
        .map((s) => SubtaskModel.fromJson(s))
        .toList(),
  );
}
