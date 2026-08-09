import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/endpoints.dart';
import '../models/user.dart';

class AuthService {
  final Dio _dio = ApiClient.instance;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(
      ApiEndpoints.login,
      data: {'email': email, 'password': password},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> signup(Map<String, dynamic> data) async {
    final response = await _dio.post(ApiEndpoints.signup, data: data);
    return response.data;
  }

  Future<void> forgotPassword(String email) async {
    await _dio.post(ApiEndpoints.forgotPassword, data: {'email': email});
  }

  Future<UserModel> getProfile() async {
    final response = await _dio.get(ApiEndpoints.profile);
    return UserModel.fromJson(response.data);
  }

  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.put(ApiEndpoints.profile, data: data);
    return UserModel.fromJson(response.data);
  }

  Future<void> changePassword(String current, String newPass) async {
    await _dio.put(ApiEndpoints.changePassword, data: {
      'current_password': current,
      'new_password': newPass,
    });
  }
}
