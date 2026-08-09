class AttendanceModel {
  final int id;
  final String taskName;
  final String location;
  final String date;
  final String startTime;
  final String endTime;
  final String duration; // e.g. "2h 30m"
  final String status;

  AttendanceModel({
    required this.id,
    required this.taskName,
    required this.location,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.duration,
    required this.status,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) => AttendanceModel(
    id: json['id'] ?? 0,
    taskName: json['task_name'] ?? '',
    location: json['location'] ?? '',
    date: json['date'] ?? '',
    startTime: json['start_time'] ?? '',
    endTime: json['end_time'] ?? '',
    duration: json['duration'] ?? '',
    status: json['status'] ?? 'completed',
  );
}
