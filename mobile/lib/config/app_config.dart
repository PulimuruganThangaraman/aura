import 'package:flutter/foundation.dart';

class AppConfig {
  static String? _customHost;

  static void setCustomHost(String host) {
    _customHost = host;
  }

  static String get baseUrl {
    if (_customHost != null && _customHost!.isNotEmpty) {
      return 'http://$_customHost:8001/api/v1';
    }
    // Default network configurations
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      // 10.0.2.2 for Android emulator, or computer LAN IP
      return 'http://10.0.2.2:8001/api/v1';
    }
    return 'http://localhost:8001/api/v1';
  }

  static const String appName = 'AuraLinks Enterprise';
  static const String version = '1.2.0';
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int geoFenceRadius = 500; // 500 meters GPS check-in radius
  static const String tokenKey = 'auralinks_token';
  static const String userKey = 'auralinks_user';
  static const String activePersonaKey = 'auralinks_persona';
}
