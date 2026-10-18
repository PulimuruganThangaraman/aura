class AdminStatsModel {
  final int totalTasks;
  final int activeTasks;
  final int completedTasks;
  final int pendingTasks;
  final int totalProfessionals;
  final int totalCompanies;
  final int totalLocations;
  final double completionRate;
  final double slaCompliance;
  final int onDutyStaff;

  AdminStatsModel({
    required this.totalTasks,
    required this.activeTasks,
    required this.completedTasks,
    required this.pendingTasks,
    required this.totalProfessionals,
    required this.totalCompanies,
    required this.totalLocations,
    required this.completionRate,
    required this.slaCompliance,
    required this.onDutyStaff,
  });

  factory AdminStatsModel.fromJson(Map<String, dynamic> json) => AdminStatsModel(
    totalTasks: json['total_tasks'] ?? 0,
    activeTasks: json['active_tasks'] ?? 0,
    completedTasks: json['completed_tasks'] ?? 0,
    pendingTasks: json['pending_tasks'] ?? 0,
    totalProfessionals: json['total_professionals'] ?? 0,
    totalCompanies: json['total_companies'] ?? 0,
    totalLocations: json['total_locations'] ?? 0,
    completionRate: json['completion_rate'] != null ? (json['completion_rate'] as num).toDouble() : 0.0,
    slaCompliance: json['sla_compliance'] != null ? (json['sla_compliance'] as num).toDouble() : 98.4,
    onDutyStaff: json['on_duty_staff'] ?? 0,
  );
}
