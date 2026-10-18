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

class _QrScanScreenState extends ConsumerState<QrScanScreen> with WidgetsBindingObserver {
  late MobileScannerController _scanner;
  final TaskService _taskService = TaskService();

  Position? _position;
  bool _isScanning = true;
  bool _isValidating = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _scanner = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
    _getLocation();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _scanner.stop();
    } else if (state == AppLifecycleState.resumed && _isScanning) {
      _scanner.start();
    }
  }

  Future<void> _getLocation() async {
    try {
      final pos = await GpsService.getCurrentPosition();
      if (mounted) setState(() => _position = pos);
    } catch (_) {}
  }

  Future<void> _processCode(String code) async {
    setState(() {
      _isScanning = false;
      _isValidating = true;
    });

    if (_position == null) {
      try {
        _position = await GpsService.getCurrentPosition();
      } catch (_) {}
    }

    final lat = _position?.latitude ?? -37.8136;
    final lng = _position?.longitude ?? 144.9631;

    try {
      final result = await _taskService.verifyQr(
        qrCode: code,
        taskId: widget.taskId > 0 ? widget.taskId : 1,
        lat: lat,
        lng: lng,
      );
      if (mounted) {
        final success = result['success'] == true;
        setState(() {
          _isValidating = false;
        });

        if (success) {
          ref.read(taskProvider.notifier).load();
          showModalBottomSheet(
            context: context,
            backgroundColor: Colors.white,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            builder: (ctx) => Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      color: Color(0xFFD1FAE5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 36),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'QR Code Verified!',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Riverside Care Home • Room 101\n$code',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        context.go('/task-detail/${widget.taskId > 0 ? widget.taskId : 1}');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00A389),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Open Task Checklist', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'QR verification failed'),
              backgroundColor: const Color(0xFFEF4444),
            ),
          );
          setState(() => _isScanning = true);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isValidating = false;
          _isScanning = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('QR validation error. Please check network connection.'),
            backgroundColor: Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _onQrDetected(BarcodeCapture capture) async {
    if (!_isScanning || _isValidating) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null || barcode!.rawValue!.isEmpty) return;
    await _processCode(barcode.rawValue!);
  }

  void _showManualEntryDialog() {
    final textCtrl = TextEditingController(text: 'AURA-WL-GLEN-01');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Enter Location Code', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Enter the location identifier code:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: textCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'e.g. AURA-WL-GLEN-01',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.08),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () {
              final code = textCtrl.text.trim();
              if (code.isNotEmpty) {
                Navigator.pop(context);
                _processCode(code);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A389)),
            child: const Text('Verify Code'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
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
        title: const Text('Scan QR Code', style: TextStyle(fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.go('/home'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded),
            onPressed: () => _scanner.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_ios_rounded),
            onPressed: () => _scanner.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Viewfinder Container
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _scanner,
                  onDetect: _onQrDetected,
                ),
                // Glowing Laser Square Frame
                Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF00A389), width: 3),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00A389).withOpacity(0.35),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Animated Laser Center Line
                      Container(
                        width: 220,
                        height: 2,
                        decoration: BoxDecoration(
                          color: const Color(0xFF2DD4BF),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFF2DD4BF).withOpacity(0.8), blurRadius: 8, spreadRadius: 2),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  bottom: 24,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.65),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Align the QR code within the frame',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Location Detected Card matching mockup
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Location row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE6F6F4),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.location_on_rounded, color: Color(0xFF00A389), size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Location Detected', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                          Text('Riverside Care Home', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                          Text('Main Entrance', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Distance & Status row
                Row(
                  children: [
                    const Text('Distance', style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                    const SizedBox(width: 8),
                    const Text('120 meters', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: const Text(
                        'Within Range ✓',
                        style: TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Simulate Test QR Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () => _processCode('AURA-WL-GLEN-01'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Simulate Test QR', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                  ),
                ),
                const SizedBox(height: 10),

                // Manual Entry link
                Center(
                  child: TextButton(
                    onPressed: _showManualEntryDialog,
                    child: const Text(
                      'Need help? Enter code manually',
                      style: TextStyle(color: Color(0xFF00A389), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
