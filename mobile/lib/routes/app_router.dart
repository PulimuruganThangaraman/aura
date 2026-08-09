import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/common/splash_screen.dart';
import '../screens/auth/landing_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/notifications/notification_screen.dart';
import '../screens/qr/qr_scan_screen.dart';
import '../screens/attendance/attendance_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isAuthRoute = state.fullPath?.startsWith('/auth') ?? false;
      final isSplash = state.fullPath == '/splash';

      if (isSplash) return null;
      if (!isAuth && !isAuthRoute) return '/auth/landing';
      if (isAuth && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(
        path: '/auth',
        redirect: (_, __) => '/auth/landing',
        routes: [
          GoRoute(path: 'landing', builder: (_, __) => const LandingScreen()),
          GoRoute(path: 'login', builder: (_, __) => const LoginScreen()),
          GoRoute(path: 'signup', builder: (_, __) => const SignupScreen()),
          GoRoute(path: 'forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
        ],
      ),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationScreen()),
      GoRoute(
        path: '/qr-scan/:taskId',
        builder: (_, state) {
          final taskId = int.parse(state.pathParameters['taskId']!);
          return QrScanScreen(taskId: taskId);
        },
      ),
      GoRoute(path: '/attendance', builder: (_, __) => const AttendanceScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    ],
  );
});
