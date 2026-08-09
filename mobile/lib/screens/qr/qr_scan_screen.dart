import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:geolocator/geolocator.dart';
import '../../services/task_service.dart';
import '../../services/gps_service.dart';
import '../../providers/task_provider.dart';

class QrScanScreen extends ConsumerStatefulWidget {
  final int taskId;

  const QrScanScreen({super.key, required this.taskId});

  @override
  ConsumerState<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends ConsumerState<QrScanScreen> {
  final MobileScannerController _scanner = MobileScannerController();
  final TaskService _taskService = TaskService();

  Position? _position;
  bool _isScanning = true;
  bool _isValidating = false;
  bool _taskStarted = false;
  String? _errorMessage;
  String? _scannedCode;

  @override
  void initState() {
    super.initState();
    _getLocation();
  }

  Future<void> _getLocation() async {
    final pos = await GpsService.getCurrentPosition();
    if (mounted) setState(() => _position = pos);
  }

  Future<void> _onQrDetected(BarcodeCapture capture) async {
    if (!_isScanning || _isValidating) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;

    final code = barcode!.rawValue!;
    setState(() {
      _isScanning = false;
      _isValidating = true;
      _scannedCode = code;
      _errorMessage = null;
    });
    _scanner.stop();

    if (_position == null) {
      setState(() {
        _isValidating = false;
        _errorMessage = 'Could not retrieve GPS location. Please enable location services.';
      });
      return;
    }

    try {
      final result = await _taskService.verifyQr(
        qrCode: code,
        taskId: widget.taskId,
        lat: _position!.latitude,
        lng: _position!.longitude,
      );
      if (mounted) {
        setState(() {
          _isValidating = false;
          _taskStarted = result['success'] == true;
          _errorMessage = _taskStarted ? null : (result['message'] ?? 'QR validation failed');
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isValidating = false;
          _errorMessage = 'QR validation error. Please try again.';
        });
      }
    }
  }

  Future<void> _completeTask() async {
    final ok = await ref.read(taskProvider.notifier).completeTask(widget.taskId);
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Task completed! Attendance recorded.'),
          backgroundColor: Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
        ),
      );
      context.go('/home');
    }
  }

  void _retryScanning() {
    setState(() {
      _isScanning = true;
      _isValidating = false;
      _errorMessage = null;
      _scannedCode = null;
    });
    _scanner.start();
  }

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        title: const Text('QR Verification', style: TextStyle(fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.go('/home'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded),
            onPressed: () => _scanner.toggleTorch(),
          ),
        ],
      ),
      body: Column(
        children: [
          // GPS info bar
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.12)),
            ),
            child: Row(
              children: [
                Icon(
                  _position != null ? Icons.gps_fixed : Icons.gps_not_fixed,
                  color: _position != null ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  size: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _position != null
                        ? 'Lat: ${_position!.latitude.toStringAsFixed(6)}  ·  Lng: ${_position!.longitude.toStringAsFixed(6)}'
                        : 'Acquiring GPS location...',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Scanner
          Expanded(
            child: _taskStarted
                ? _successState()
                : _isValidating
                    ? _validatingState()
                    : _errorMessage != null
                        ? _errorState()
                        : _scannerView(),
          ),
          // Bottom action
          Padding(
            padding: const EdgeInsets.all(20),
            child: _taskStarted
                ? SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton.icon(
                      onPressed: _completeTask,
                      icon: const Icon(Icons.check_circle_outline, size: 22),
                      label: const Text('Complete Task', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  )
                : _errorMessage != null
                    ? SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton.icon(
                          onPressed: _retryScanning,
                          icon: const Icon(Icons.refresh, size: 20),
                          label: const Text('Retry Scan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1A56DB),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      )
                    : Text(
                        'Point camera at the work location QR code',
                        style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 14),
                        textAlign: TextAlign.center,
                      ),
          ),
        ],
      ),
    );
  }

  Widget _scannerView() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Stack(
        alignment: Alignment.center,
        children: [
          MobileScanner(
            controller: _scanner,
            onDetect: _onQrDetected,
          ),
          // Scan frame overlay
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF1A56DB), width: 3),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _validatingState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: Color(0xFF1A56DB), strokeWidth: 3),
          const SizedBox(height: 20),
          Text(
            'Validating QR code...',
            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 16),
          ),
          if (_scannedCode != null) ...[
            const SizedBox(height: 8),
            Text(
              _scannedCode!,
              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
            ),
          ],
        ],
      ),
    );
  }

  Widget _successState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 48),
          ),
          const SizedBox(height: 20),
          const Text(
            'Task Started!',
            style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            'QR verified. Press Complete when done.',
            style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _errorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.qr_code_2_rounded, color: Color(0xFFEF4444), size: 42),
            ),
            const SizedBox(height: 20),
            const Text(
              'Validation Failed',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            Text(
              _errorMessage ?? '',
              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14, height: 1.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
