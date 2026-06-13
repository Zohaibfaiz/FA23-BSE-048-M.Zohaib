export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ASSISTANT: 'assistant',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ROLE_DASHBOARD = {
  patient: '/patient',
  doctor: '/doctor',
  assistant: '/assistant',
  admin: '/admin',
  superadmin: '/superadmin',
};

export const ROLE_ACCENT = {
  patient: '#6b9b8a',
  doctor: '#c9a962',
  assistant: '#b87333',
  admin: '#8b7aa8',
  superadmin: '#d45d5d',
};

export const TREATMENT_COLORS = {
  allopathic: 'badge-allopathic rounded-lg px-2 py-0.5 text-xs capitalize',
  homeopathic: 'badge-homeopathic rounded-lg px-2 py-0.5 text-xs capitalize',
  herbal: 'badge-herbal rounded-lg px-2 py-0.5 text-xs capitalize',
};

export const APPOINTMENT_STATUS = {
  pending: { label: 'Pending', class: 'status-pending rounded-lg px-3 py-1 text-xs font-medium', pulse: true },
  confirmed: { label: 'Confirmed', class: 'status-confirmed rounded-lg px-3 py-1 text-xs font-medium', pulse: false },
  completed: { label: 'Completed', class: 'status-completed rounded-lg px-3 py-1 text-xs font-medium', pulse: false },
  cancelled: { label: 'Cancelled', class: 'status-cancelled rounded-lg px-3 py-1 text-xs font-medium', pulse: false },
};

export const PATIENT_NAV = [
  { to: '/patient', label: 'Home', icon: 'Home' },
  { to: '/patient/doctors', label: 'Find Doctors', icon: 'Search' },
  { to: '/patient/appointments', label: 'My Appointments', icon: 'Calendar' },
  { to: '/patient/history', label: 'Medical History', icon: 'FileText' },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: 'Pill' },
  { to: '/patient/profile', label: 'Profile', icon: 'User' },
];

export const DOCTOR_NAV = [
  { to: '/doctor', label: 'Overview', icon: 'LayoutDashboard' },
  { to: '/doctor/appointments', label: 'Appointments', icon: 'Calendar' },
  { to: '/doctor/patients', label: 'Patients', icon: 'Users' },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: 'Pill' },
  { to: '/doctor/clinics', label: 'Clinics', icon: 'Building2' },
  { to: '/doctor/schedule', label: 'Schedule', icon: 'Clock' },
  { to: '/doctor/profile', label: 'Profile', icon: 'User' },
];

export const ASSISTANT_NAV = [
  { to: '/assistant', label: 'Pending Payments', icon: 'CreditCard' },
  { to: '/assistant/verified', label: 'Verified', icon: 'CheckCircle' },
  { to: '/assistant/queue', label: 'Queue', icon: 'List' },
];

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'Stethoscope' },
  { to: '/admin/patients', label: 'Patients', icon: 'Users' },
  { to: '/admin/users', label: 'Users', icon: 'UserCog' },
  { to: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
  { to: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

export const SUPERADMIN_NAV = [
  ...ADMIN_NAV,
  { to: '/superadmin/config', label: 'System Config', icon: 'Server' },
  { to: '/superadmin/audit', label: 'Audit Logs', icon: 'ScrollText' },
  { to: '/superadmin/admins', label: 'Admins', icon: 'Shield' },
];

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
];

export const POPULAR_DISEASES = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Skin Problems',
  'Fever',
];

export const DOCTOR_CATEGORIES = [
  {
    value: 'allopathic',
    label: 'Allopathic',
    description: 'Modern medicine practitioners — specialists in diagnosis, surgery, and evidence-based care.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'homeopathic',
    label: 'Homeopathic',
    description: 'Natural healing through diluted remedies tailored to your constitution and symptoms.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    value: 'herbal',
    label: 'Herbal',
    description: 'Plant-based treatments rooted in traditional wisdom and holistic wellness.',
    gradient: 'from-green-500 to-lime-500',
  },
];

export const TREATMENT_SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Neurology',
  'General Medicine',
  'ENT',
  'Psychiatry',
  'Dentistry',
];

export const PLATFORM_CONTACT = {
  email: 'support@doctorhub.pk',
  phone: '+92 300 1234567',
  headquarters: 'Karachi, Pakistan',
};
