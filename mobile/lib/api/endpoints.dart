class ApiEndpoints {
  // Auth
  static const String login = '/auth/login';
  static const String signup = '/auth/signup';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String profile = '/auth/profile';
  static const String changePassword = '/auth/change-password';

  // Mobile – Tasks
  static const String mobileNotifications = '/mobile/notifications';
  static const String mobileTasks = '/mobile/tasks';
  static String mobileTaskDetail(int id) => '/mobile/tasks/$id';
  static String acceptTask(int id) => '/mobile/tasks/$id/accept';
  static String declineTask(int id) => '/mobile/tasks/$id/decline';
  static String startTask(int id) => '/mobile/tasks/$id/start';
  static const String verifyQr = '/mobile/tasks/verify-qr';
  static String completeTask(int id) => '/mobile/tasks/$id/complete';

  // Attendance
  static const String attendance = '/mobile/attendance';
}
