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

  SubtaskModel copyWith({bool? isCompleted}) {
    return SubtaskModel(
      id: id,
      name: name,
      startTime: startTime,
      endTime: endTime,
      instructions: instructions,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

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
  final String? taskId;
  final int? scheduleId;
  final String? jobId;
  final String? jobTitle;
  final String name;
  final String category;
  final String location;
  final String workLocation;
  final int? companyId;
  final String? companyName;
  final String shift;
  final String? scheduledDate;
  final String? startTime;
  final String? endTime;
  final String status; // 'accepted', 'in_progress', 'completed', 'declined'
  final String rawStatus;
  final String? qrCode;
  final double? latitude;
  final double? longitude;
  final double? distanceMeters;
  final bool isInRange;
  final List<String> assignedProfessionals;
  final List<SubtaskModel> subtasks;

  TaskModel({
    required this.id,
    this.taskId,
    this.scheduleId,
    this.jobId,
    this.jobTitle,
    required this.name,
    required this.category,
    required this.location,
    required this.workLocation,
    this.companyId,
    this.companyName,
    required this.shift,
    this.scheduledDate,
    this.startTime,
    this.endTime,
    required this.status,
    this.rawStatus = 'YetToStart',
    this.qrCode,
    this.latitude,
    this.longitude,
    this.distanceMeters,
    this.isInRange = false,
    this.assignedProfessionals = const [],
    this.subtasks = const [],
  });

  TaskModel copyWith({
    String? status,
    String? rawStatus,
    double? distanceMeters,
    bool? isInRange,
    List<SubtaskModel>? subtasks,
  }) {
    return TaskModel(
      id: id,
      scheduleId: scheduleId,
      name: name,
      category: category,
      location: location,
      workLocation: workLocation,
      companyId: companyId,
      companyName: companyName,
      shift: shift,
      scheduledDate: scheduledDate,
      startTime: startTime,
      endTime: endTime,
      status: status ?? this.status,
      rawStatus: rawStatus ?? this.rawStatus,
      qrCode: qrCode,
      latitude: latitude,
      longitude: longitude,
      distanceMeters: distanceMeters ?? this.distanceMeters,
      isInRange: isInRange ?? this.isInRange,
      assignedProfessionals: assignedProfessionals,
      subtasks: subtasks ?? this.subtasks,
    );
  }

  factory TaskModel.fromJson(Map<String, dynamic> json) => TaskModel(
    id: json['id'] ?? 0,
    taskId: json['task_id'] ?? 'TSK-${(json['id'] ?? 0).toString().padLeft(4, '0')}',
    scheduleId: json['schedule_id'],
    jobId: json['job_id'] ?? (json['schedule_id'] != null ? 'JOB-${json['schedule_id'].toString().padLeft(4, '0')}' : null),
    jobTitle: json['job_title'],
    name: json['name'] ?? '',
    category: json['category'] ?? '',
    location: json['location'] ?? '',
    workLocation: json['work_location'] ?? '',
    companyId: json['company_id'],
    companyName: json['company_name'],
    shift: json['shift'] ?? '',
    scheduledDate: json['scheduled_date'],
    startTime: json['start_time'],
    endTime: json['end_time'],
    status: json['status'] ?? 'accepted',
    rawStatus: json['raw_status'] ?? 'YetToStart',
    qrCode: json['qr_code'],
    latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
    longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
    distanceMeters: json['distance_meters'] != null ? (json['distance_meters'] as num).toDouble() : null,
    isInRange: json['is_in_range'] ?? false,
    assignedProfessionals: (json['assigned_professionals'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList(),
    subtasks: (json['subtasks'] as List<dynamic>? ?? [])
        .map((s) => SubtaskModel.fromJson(s))
        .toList(),
  );
}

