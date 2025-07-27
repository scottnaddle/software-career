export interface User {
  id: string;
  email: string;
  name?: string;
  account_type: 'individual' | 'expert' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  account_type: 'individual' | 'expert' | 'admin';
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  pendingExperts: number;
  totalPayments: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface ExpertApplication {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  rate: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'certificate' | 'expert_verification';
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  type: 'comprehensive' | 'specific';
  careers: number[];
  issued_at: string;
  download_url?: string;
}

export interface AppError {
  message: string;
  code: string;
  statusCode: number;
}