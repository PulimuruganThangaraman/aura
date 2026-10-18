import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/task.dart';
import '../models/notification.dart';
import '../models/admin_stats.dart';
import '../models/company.dart';
import '../services/task_service.dart';
import 'auth_provider.dart';

final taskServiceProvider = Provider<TaskService>((ref) => TaskService());

// View mode: 'professional' or 'admin'
final activeViewModeProvider = StateProvider<String>((ref) => 'professional');

// Selected Company filter for global task view
final selectedCompanyFilterProvider = StateProvider<int?>((ref) => null);

// Notifications Provider
class NotificationNotifier extends StateNotifier<AsyncValue<List<NotificationModel>>> {
  final TaskService _service;

  NotificationNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final notifications = await _service.getNotifications();
      state = AsyncValue.data(notifications);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> accept(int taskId) async {
    try {
      await _service.acceptTask(taskId);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> decline(int taskId) async {
    try {
      await _service.declineTask(taskId);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, AsyncValue<List<NotificationModel>>>((ref) {
  return NotificationNotifier(ref.read(taskServiceProvider));
});

// Tasks Provider
class TaskNotifier extends StateNotifier<AsyncValue<List<TaskModel>>> {
  final TaskService _service;
  final Ref _ref;
  String _filter = 'day';
  String? _status;
  int? _companyId;
  String? _search;
  String? _professional;
  double? _userLat;
  double? _userLng;

  TaskNotifier(this._service, this._ref) : super(const AsyncValue.loading());

  Future<void> load({
    String? filter,
    String? status,
    int? companyId,
    String? search,
    String? professional,
    double? userLat,
    double? userLng,
  }) async {
    if (filter != null) _filter = filter;
    if (status != null) _status = status == 'all' ? null : status;
    if (companyId != null) _companyId = companyId == 0 ? null : companyId;
    if (search != null) _search = search;
    if (professional != null) _professional = professional;
    if (userLat != null) _userLat = userLat;
    if (userLng != null) _userLng = userLng;

    final user = _ref.read(authProvider).user;
    final viewMode = _ref.read(activeViewModeProvider);

    state = const AsyncValue.loading();
    try {
      final tasks = await _service.getTasks(
        filter: _filter,
        status: _status,
        companyId: _companyId,
        search: _search,
        professional: _professional,
        userId: user?.id,
        userEmail: user?.email,
        role: viewMode == 'admin' ? (user?.role ?? 'Super Admin') : 'Professional',
        userLat: _userLat,
        userLng: _userLng,
        limit: 500,
      );
      state = AsyncValue.data(tasks);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> startTask(int taskId, {double? lat, double? lng, String? qrCode}) async {
    try {
      await _service.startTask(taskId, lat: lat, lng: lng, qrCode: qrCode);
      
      // Update local state immediately
      state.whenData((tasks) {
        final updated = tasks.map((t) {
          if (t.id == taskId) {
            return t.copyWith(status: 'in_progress', rawStatus: 'InProgress');
          }
          return t;
        }).toList();
        state = AsyncValue.data(updated);
      });
      
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }

  void toggleSubtaskLocally(int taskId, int subtaskId) {
    state.whenData((tasks) {
      final updated = tasks.map((t) {
        if (t.id == taskId) {
          final updatedSubtasks = t.subtasks.map((s) {
            if (s.id == subtaskId) {
              return s.copyWith(isCompleted: !s.isCompleted);
            }
            return s;
          }).toList();
          return t.copyWith(subtasks: updatedSubtasks);
        }
        return t;
      }).toList();
      state = AsyncValue.data(updated);
    });
  }

  Future<bool> completeTask(int taskId) async {
    try {
      await _service.completeTask(taskId);
      
      // Update local state
      state.whenData((tasks) {
        final updated = tasks.map((t) {
          if (t.id == taskId) {
            return t.copyWith(status: 'completed', rawStatus: 'Ended');
          }
          return t;
        }).toList();
        state = AsyncValue.data(updated);
      });

      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final taskProvider =
    StateNotifierProvider<TaskNotifier, AsyncValue<List<TaskModel>>>((ref) {
  return TaskNotifier(ref.read(taskServiceProvider), ref);
});

// Admin Stats Provider
final adminStatsProvider = FutureProvider<AdminStatsModel>((ref) async {
  final service = ref.read(taskServiceProvider);
  return await service.getAdminStats();
});

// Companies List Provider
final companiesProvider = FutureProvider<List<CompanyModel>>((ref) async {
  final service = ref.read(taskServiceProvider);
  return await service.getCompanies();
});

// Admin Professionals List Provider
final adminProfessionalsProvider = FutureProvider<List<ProfessionalModel>>((ref) async {
  final service = ref.read(taskServiceProvider);
  final companyId = ref.watch(selectedCompanyFilterProvider);
  return await service.getAdminProfessionals(companyId: companyId);
});
