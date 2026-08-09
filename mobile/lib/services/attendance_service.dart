import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/endpoints.dart';
import '../models/attendance.dart';

class AttendanceService {
  final Dio _dio = ApiClient.instance;

  Future<List<AttendanceModel>> getAttendance({String? filter}) async {
    final response = await _dio.get(
      ApiEndpoints.attendance,
      queryParameters: filter != null ? {'filter': filter} : null,
    );
    return (response.data as List)
        .map((e) => AttendanceModel.fromJson(e))
        .toList();
  }
}
