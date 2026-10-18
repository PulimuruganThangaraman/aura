import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/endpoints.dart';
import '../models/task.dart';
import '../models/notification.dart';
import '../models/admin_stats.dart';
import '../models/company.dart';

class TaskService {
  final Dio _dio = ApiClient.instance;

  Future<List<NotificationModel>> getNotifications() async {
    final response = await _dio.get(ApiEndpoints.mobileNotifications);
    return (response.data as List)
        .map((e) => NotificationModel.fromJson(e))
        .toList();
  }

  Future<void> acceptTask(int taskId) async {
    await _dio.post(ApiEndpoints.acceptTask(taskId));
  }

  Future<void> declineTask(int taskId) async {
    await _dio.post(ApiEndpoints.declineTask(taskId));
  }

  Future<List<TaskModel>> getTasks({
    String filter = 'day',
    String? status,
    int? companyId,
    String? search,
    String? professional,
    int? userId,
    String? userEmail,
    String? role,
    double? userLat,
    double? userLng,
    int limit = 500,
    int offset = 0,
  }) async {
    final queryParams = <String, dynamic>{
      'filter': filter,
      'limit': limit,
      'offset': offset,
    };
    if (status != null && status.isNotEmpty) queryParams['status'] = status;
    if (companyId != null) queryParams['company_id'] = companyId;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (professional != null && professional.isNotEmpty) queryParams['professional'] = professional;
    if (userId != null) queryParams['user_id'] = userId;
    if (userEmail != null && userEmail.isNotEmpty) queryParams['user_email'] = userEmail;
    if (role != null && role.isNotEmpty) queryParams['role'] = role;
    if (userLat != null) queryParams['user_lat'] = userLat;
    if (userLng != null) queryParams['user_lng'] = userLng;

    final response = await _dio.get(
      ApiEndpoints.mobileTasks,
      queryParameters: queryParams,
    );
    return (response.data as List).map((e) => TaskModel.fromJson(e)).toList();
  }

  Future<TaskModel> getTaskDetail(int id) async {
    final response = await _dio.get(ApiEndpoints.mobileTaskDetail(id));
    return TaskModel.fromJson(response.data);
  }

  Future<Map<String, dynamic>> startTask(
    int taskId, {
    double? lat,
    double? lng,
    String? qrCode,
  }) async {
    final payload = <String, dynamic>{};
    if (lat != null) payload['latitude'] = lat;
    if (lng != null) payload['longitude'] = lng;
    if (qrCode != null) payload['qr_code'] = qrCode;

    final response = await _dio.post(
      ApiEndpoints.startTask(taskId),
      data: payload,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> verifyQr({
    required String qrCode,
    required int taskId,
    required double lat,
    required double lng,
  }) async {
    final response = await _dio.post(ApiEndpoints.verifyQr, data: {
      'qr_code': qrCode,
      'task_id': taskId,
      'latitude': lat,
      'longitude': lng,
    });
    return response.data;
  }

  Future<void> completeTask(int taskId) async {
    await _dio.post(ApiEndpoints.completeTask(taskId));
  }

  // Admin APIs
  Future<AdminStatsModel> getAdminStats() async {
    final response = await _dio.get(ApiEndpoints.adminStats);
    return AdminStatsModel.fromJson(response.data);
  }

  Future<List<ProfessionalModel>> getAdminProfessionals({
    int? companyId,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{};
    if (companyId != null) queryParams['company_id'] = companyId;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final response = await _dio.get(
      ApiEndpoints.adminProfessionals,
      queryParameters: queryParams,
    );
    return (response.data as List)
        .map((e) => ProfessionalModel.fromJson(e))
        .toList();
  }

  Future<List<CompanyModel>> getCompanies() async {
    final response = await _dio.get(ApiEndpoints.companies);
    return (response.data as List)
        .map((e) => CompanyModel.fromJson(e))
        .toList();
  }
}
