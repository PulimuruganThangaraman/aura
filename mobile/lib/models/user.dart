class UserModel {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? dob;
  final String? gender;
  final String role;
  final int? companyId;
  final String? companyName;
  final bool isActive;
  final List<String> skills;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phone,
    this.dob,
    this.gender,
    required this.role,
    this.companyId,
    this.companyName,
    required this.isActive,
    this.skills = const [],
  });

  String get fullName => '$firstName $lastName'.trim();
  bool get isAdmin => role.toLowerCase().contains('admin');

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      phone: json['phone'],
      dob: json['dob'],
      gender: json['gender'],
      role: json['role'] ?? 'Professional',
      companyId: json['company_id'],
      companyName: json['company_name'],
      isActive: json['is_active'] ?? true,
      skills: List<String>.from(json['skills'] ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'first_name': firstName,
    'last_name': lastName,
    'phone': phone,
    'dob': dob,
    'gender': gender,
    'role': role,
    'company_id': companyId,
    'company_name': companyName,
    'is_active': isActive,
    'skills': skills,
  };
}
