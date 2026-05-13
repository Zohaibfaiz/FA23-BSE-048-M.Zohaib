// ==============================
// Core TypeScript Models / Interfaces
// Committee Management System
// ==============================

// ---- User / Profile ----
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  iban?: string;
  bank_account?: string;
  easypaisa_number?: string;
  jazzcash_number?: string;
  reputation_score: number;
  completed_committees: number;
  active_committees: number;
  ontime_payment_pct: number;
  role: 'user' | 'admin' | 'moderator';
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Committee ----
export type CommitteeStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'cash';

export interface Committee {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  monthly_amount: number;
  duration_months: number;
  max_members: number;
  current_members: number;
  start_date: string;
  end_date?: string;
  rules?: string;
  payment_method: PaymentMethod;
  status: CommitteeStatus;
  current_month: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // joins
  creator?: Profile;
  members?: CommitteeMember[];
}

// ---- Committee Member ----
export type MemberStatus = 'active' | 'removed' | 'left' | 'suspended';

export interface CommitteeMember {
  id: string;
  committee_id: string;
  user_id: string;
  turn_number: number;
  joined_at: string;
  iban?: string;
  bank_account?: string;
  easypaisa_number?: string;
  jazzcash_number?: string;
  status: MemberStatus;
  total_paid: number;
  total_due: number;
  has_received_turn: boolean;
  // joins
  profile?: Profile;
  committee?: Committee;
}

// ---- Payment ----
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'waived';

export interface Payment {
  id: string;
  committee_id: string;
  member_id: string;
  month_number: number;
  amount: number;
  status: PaymentStatus;
  transaction_id?: string;
  proof_url?: string;
  due_date: string;
  paid_at?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  // joins
  member?: CommitteeMember;
  committee?: Committee;
}

// ---- Join Request ----
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  id: string;
  committee_id: string;
  user_id: string;
  status: JoinRequestStatus;
  message?: string;
  created_at: string;
  // joins
  profile?: Profile;
  committee?: Committee;
}

// ---- Notification ----
export type NotificationType =
  | 'payment_due' | 'payment_received' | 'payment_overdue' | 'payment_confirmed'
  | 'your_turn' | 'join_request' | 'join_approved' | 'join_rejected'
  | 'committee_started' | 'committee_completed' | 'member_removed' | 'general';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

// ---- Review ----
export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  committee_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  reviewer?: Profile;
}

// ---- Reputation Log ----
export interface ReputationLog {
  id: string;
  user_id: string;
  change: number;
  reason: string;
  created_at: string;
}

// ---- Activity Log ----
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  activeCommittees: number;
  totalSaved: number;
  upcomingTurn: string | null;
  thisMonthDue: number;
  completedCommittees: number;
  pendingPayments: number;
  reputationScore: number;
}

// ---- API Response ----
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ---- Auth ----
export interface LoginCredentials  { email: string; password: string; }
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// ---- Committee Filter ----
export interface CommitteeFilter {
  search?: string;
  status?: CommitteeStatus;
  minAmount?: number;
  maxAmount?: number;
  duration?: number;
  paymentMethod?: PaymentMethod;
  sortBy?: 'created_at' | 'monthly_amount' | 'members' | 'start_date';
  sortDir?: 'asc' | 'desc';
}

// ---- Charts ----
export interface ChartDataPoint { label: string; value: number; }

// ---- Toast ----
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
