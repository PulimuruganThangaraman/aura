import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/endpoints.dart';
import '../models/task.dart';
import '../models/notification.dart';

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

  Future<List<TaskModel>> getTasks({String filter = 'day'}) async {
    final response = await _dio.get(
      ApiEndpoints.mobileTasks,
      queryParameters: {'filter': filter},
    );
    return (response.data as List).map((e) => TaskModel.fromJson(e)).toList();
  }

  Future<TaskModel> getTaskDetail(int id) async {
    final response = await _dio.get(ApiEndpoints.mobileTaskDetail(id));
    return TaskModel.fromJson(response.data);
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
}
