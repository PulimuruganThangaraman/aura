import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

class AuthState {
  final UserModel? user;
  final String? token;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.token, this.isLoading = false, this.error});

  bool get isAuthenticated => token != null && user != null;

  AuthState copyWith({
    UserModel? user,
    String? token,
    bool? isLoading,
    String? error,
    bool clearError = false,
    bool clearToken = false,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: clearToken ? null : (token ?? this.token),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _service;

  AuthNotifier(this._service) : super(const AuthState());

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final data = await _service.login(email, password);
      final token = data['access_token'] as String;
      await ApiClient.setToken(token);
      final user = await _service.getProfile();
      state = state.copyWith(isLoading: false, token: token, user: user);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid email or password',
      );
      return false;
    }
  }

  Future<bool> tryAutoLogin() async {
    final token = await ApiClient.getToken();
    if (token == null) return false;
    try {
      state = state.copyWith(token: token);
      final user = await _service.getProfile();
      state = state.copyWith(user: user);
      return true;
    } catch (_) {
      await ApiClient.clearToken();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiClient.clearToken();
    state = const AuthState();
  }

  Future<bool> signup(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _service.signup(data);
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Registration failed. Email may already be in use.',
      );
      return false;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final user = await _service.updateProfile(data);
      state = state.copyWith(user: user);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> changePassword(String current, String newPass) async {
    try {
      await _service.changePassword(current, newPass);
      return true;
    } catch (_) {
      return false;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});
