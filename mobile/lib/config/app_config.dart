import 'package:flutter/foundation.dart';

class AppConfig {
  static String get baseUrl {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api/v1';
    }
    return 'http://localhost:8000/api/v1';
  }
  static const String appName = 'AuraLinks';
  static const String version = '1.0.0';
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int geoFenceRadius = 500; // meters
  static const String tokenKey = 'auralinks_token';
  static const String userKey = 'auralinks_user';
}
