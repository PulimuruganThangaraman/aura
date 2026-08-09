import 'package:geolocator/geolocator.dart';

class GpsService {
  static Future<Position?> getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return null;
    }
    if (permission == LocationPermission.deniedForever) return null;

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Returns distance in meters between two coordinates using Geolocator
  static double distanceBetween(
    double lat1, double lon1, double lat2, double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  /// Checks if user is within [radiusMeters] of the work location
  static bool isWithinGeofence({
    required double userLat,
    required double userLng,
    required double locationLat,
    required double locationLng,
    required double radiusMeters,
  }) {
    final distance = distanceBetween(userLat, userLng, locationLat, locationLng);
    return distance <= radiusMeters;
  }
}
