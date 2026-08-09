import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/task.dart';
import '../models/notification.dart';
import '../services/task_service.dart';

final taskServiceProvider = Provider<TaskService>((ref) => TaskService());

// Notifications
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

// Tasks
class TaskNotifier extends StateNotifier<AsyncValue<List<TaskModel>>> {
  final TaskService _service;
  String _filter = 'day';

  TaskNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> load({String filter = 'day'}) async {
    _filter = filter;
    state = const AsyncValue.loading();
    try {
      final tasks = await _service.getTasks(filter: filter);
      state = AsyncValue.data(tasks);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> completeTask(int taskId) async {
    try {
      await _service.completeTask(taskId);
      await load(filter: _filter);
      return true;
    } catch (_) {
      return false;
    }
  }
}

final taskProvider =
    StateNotifierProvider<TaskNotifier, AsyncValue<List<TaskModel>>>((ref) {
  return TaskNotifier(ref.read(taskServiceProvider));
});
