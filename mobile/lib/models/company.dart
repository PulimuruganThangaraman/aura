class CompanyModel {
  final int id;
  final String name;
  final String code;
  final String? industryType;
  final String? city;
  final String? state;
  final int professionalsCount;

  CompanyModel({
    required this.id,
    required this.name,
    required this.code,
    this.industryType,
    this.city,
    this.state,
    this.professionalsCount = 0,
  });

  factory CompanyModel.fromJson(Map<String, dynamic> json) => CompanyModel(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    code: json['code'] ?? '',
    industryType: json['industry_type'],
    city: json['city'],
    state: json['state'],
    professionalsCount: json['professionals_count'] ?? 0,
  );
}

class ProfessionalModel {
  final int id;
  final String fullName;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final List<String> skills;
  final String status;
  final bool isActive;
  final int? companyId;
  final String? companyName;

  ProfessionalModel({
    required this.id,
    required this.fullName,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.skills = const [],
    required this.status,
    this.isActive = true,
    this.companyId,
    this.companyName,
  });

  factory ProfessionalModel.fromJson(Map<String, dynamic> json) => ProfessionalModel(
    id: json['id'] ?? 0,
    fullName: json['full_name'] ?? '${json['first_name'] ?? ''} ${json['last_name'] ?? ''}',
    firstName: json['first_name'] ?? '',
    lastName: json['last_name'] ?? '',
    email: json['email'] ?? '',
    phone: json['phone'],
    skills: (json['skills'] as List<dynamic>? ?? []).map((s) => s.toString()).toList(),
    status: json['status'] ?? 'Accepted',
    isActive: json['is_active'] ?? true,
    companyId: json['company_id'],
    companyName: json['company_name'],
  );
}
