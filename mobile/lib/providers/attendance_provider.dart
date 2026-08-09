import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/attendance.dart';
import '../services/attendance_service.dart';

final attendanceServiceProvider =
    Provider<AttendanceService>((ref) => AttendanceService());

class AttendanceNotifier
    extends StateNotifier<AsyncValue<List<AttendanceModel>>> {
  final AttendanceService _service;

  AttendanceNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> load({String filter = 'today'}) async {
    state = const AsyncValue.loading();
    try {
      final records = await _service.getAttendance(filter: filter);
      state = AsyncValue.data(records);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final attendanceProvider =
    StateNotifierProvider<AttendanceNotifier, AsyncValue<List<AttendanceModel>>>(
  (ref) => AttendanceNotifier(ref.read(attendanceServiceProvider)),
);

// Theme provider
final themeModeProvider = StateProvider<bool>((ref) => false); // false = light
