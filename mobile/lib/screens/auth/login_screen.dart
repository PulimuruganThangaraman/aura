import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  int _selectedRoleIndex = 0; // 0 = Company Admin, 1 = Super Admin, 2 = Care Professional

  final _emailCtrl = TextEditingController(text: 'ushanlokuge@msn.com');
  final _passCtrl = TextEditingController(text: '123456');
  bool _obscure = true;
  bool _rememberMe = true;

  final List<Map<String, dynamic>> _roleOptions = [
    {
      'title': 'Company\nAdmin',
      'icon': Icons.business_center_rounded,
      'email': 'ushanlokuge@msn.com',
      'pass': '123456',
      'desc': 'Company Admin: Manage all professionals, jobs, and tasks under your company.',
      'isAdmin': true,
      'color': const Color(0xFF00A389),
    },
    {
      'title': 'Care\nProfessional',
      'icon': Icons.medical_services_rounded,
      'email': 'professional@auralinks.com',
      'pass': '123456',
      'desc': 'Professional: View only your assigned jobs and tasks, check in and complete care checklists.',
      'isAdmin': false,
      'color': const Color(0xFF0284C7),
    },
  ];

  void _selectRole(int index) {
    setState(() {
      _selectedRoleIndex = index;
      _emailCtrl.text = _roleOptions[index]['email'];
      _passCtrl.text = _roleOptions[index]['pass'];
    });

    if (_roleOptions[index]['isAdmin']) {
      ref.read(activeViewModeProvider.notifier).state = 'admin';
    } else {
      ref.read(activeViewModeProvider.notifier).state = 'professional';
    }
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    // Check if Super Admin email is entered
    if (_emailCtrl.text.trim().toLowerCase().contains('super.admin')) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.laptop_chromebook_rounded, color: Color(0xFF6366F1)),
              SizedBox(width: 8),
              Text('Web Portal Only', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: const Text(
            'Super Admin multi-tenant management is restricted to the Web Portal. Please log in using a desktop browser.',
            style: TextStyle(fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    final success = await ref
        .read(authProvider.notifier)
        .login(_emailCtrl.text.trim(), _passCtrl.text);
    if (!mounted) return;
    if (success) {
      final user = ref.read(authProvider).user;
      if (user != null && user.role == 'Super Admin') {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.laptop_chromebook_rounded, color: Color(0xFF6366F1)),
                SizedBox(width: 8),
                Text('Web Portal Only', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Super Admin platform management is restricted to the Web Portal. Please log in using a desktop web browser.',
              style: TextStyle(fontSize: 13),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        return;
      }

      if (_selectedRoleIndex == 0 || (user != null && user.isAdmin)) {
        ref.read(activeViewModeProvider.notifier).state = 'admin';
        context.go('/admin');
      } else {
        ref.read(activeViewModeProvider.notifier).state = 'professional';
        context.go('/dashboard');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Invalid credentials. Please try again.'),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final activeRole = _roleOptions[_selectedRoleIndex];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.go('/auth/landing'),
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF0F172A), size: 18),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Titles
                const Text(
                  'Welcome Back',
                  style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Sign in to your AuraLinks account',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 20),

                // 3 Role Tabs
                Row(
                  children: List.generate(_roleOptions.length, (index) {
                    final role = _roleOptions[index];
                    final isSelected = _selectedRoleIndex == index;

                    return Expanded(
                      child: GestureDetector(
                        onTap: () => _selectRole(index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          margin: EdgeInsets.only(
                            left: index == 0 ? 0 : 4,
                            right: index == 2 ? 0 : 4,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF00A389) : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF00A389) : const Color(0xFFE2E8F0),
                              width: 1.5,
                            ),
                            boxShadow: isSelected
                                ? [BoxShadow(color: const Color(0xFF00A389).withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 3))]
                                : null,
                          ),
                          child: Column(
                            children: [
                              Icon(
                                role['icon'] as IconData,
                                color: isSelected ? Colors.white : const Color(0xFF64748B),
                                size: 20,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                role['title'] as String,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  height: 1.1,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 14),

                // Role description helper
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    activeRole['desc'] as String,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF475569), fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ),
                const SizedBox(height: 20),

                // Email Input
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.w500),
                  decoration: InputDecoration(
                    hintText: 'Enter your email',
                    prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF64748B), size: 18),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF00A389), width: 2)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Please enter your email' : null,
                ),
                const SizedBox(height: 14),

                // Password Input
                TextFormField(
                  controller: _passCtrl,
                  obscureText: _obscure,
                  style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.w500),
                  decoration: InputDecoration(
                    hintText: 'Enter your password',
                    prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF64748B), size: 18),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(
                        _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: const Color(0xFF94A3B8),
                        size: 18,
                      ),
                    ),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF00A389), width: 2)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Please enter your password' : null,
                ),
                const SizedBox(height: 12),

                // Remember Me + Forgot Password
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => setState(() => _rememberMe = !_rememberMe),
                      child: Row(
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            decoration: BoxDecoration(
                              color: _rememberMe ? const Color(0xFF00A389) : Colors.transparent,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: _rememberMe ? const Color(0xFF00A389) : const Color(0xFF94A3B8),
                              ),
                            ),
                            child: _rememberMe ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Remember me',
                            style: TextStyle(color: Color(0xFF334155), fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.go('/auth/forgot-password'),
                      child: const Text(
                        'Forgot password?',
                        style: TextStyle(color: Color(0xFF00A389), fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Main Login Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: authState.isLoading ? null : _login,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00A389),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    child: authState.isLoading
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Text(
                            'Login',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.3),
                          ),
                  ),
                ),
                const SizedBox(height: 24),

                // OR Divider
                Row(
                  children: [
                    const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'OR',
                        style: TextStyle(color: const Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                    const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                  ],
                ),
                const SizedBox(height: 16),

                // Quick Demo Login Header
                const Center(
                  child: Text(
                    'Quick Demo Login',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(height: 12),

                // 3 Quick Demo Buttons
                _demoFullButton(
                  title: 'Company Admin',
                  color: const Color(0xFF00A389),
                  onTap: () {
                    _selectRole(0);
                    _login();
                  },
                ),
                const SizedBox(height: 8),
                _demoFullButton(
                  title: 'Super Admin',
                  color: const Color(0xFF6366F1),
                  onTap: () {
                    _selectRole(1);
                    _login();
                  },
                ),
                const SizedBox(height: 8),
                _demoFullButton(
                  title: 'Care Professional',
                  color: const Color(0xFF0284C7),
                  onTap: () {
                    _selectRole(2);
                    _login();
                  },
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _demoFullButton({required String title, required Color color, required VoidCallback onTap}) {
    return SizedBox(
      width: double.infinity,
      height: 44,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(
          title,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
