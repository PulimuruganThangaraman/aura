class UserModel {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? dob;
  final String? gender;
  final String role;
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
    required this.isActive,
    this.skills = const [],
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      phone: json['phone'],
      dob: json['dob'],
      gender: json['gender'],
      role: json['role'] ?? 'professional',
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
    'is_active': isActive,
    'skills': skills,
  };
}
