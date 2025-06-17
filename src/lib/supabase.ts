import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  account_type: 'individual' | 'enterprise';
  company?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  user_id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
  type: 'project' | 'education' | 'certificate' | 'experience';
  technologies: string[];
  achievements?: string[];
  status: 'draft' | 'pending' | 'verified' | 'rejected';
  verification_date?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  type: 'basic' | 'premium' | 'official';
  career_ids: string[];
  issue_date: string;
  certificate_number: string;
  qr_code: string;
  status: 'active' | 'revoked';
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  type: 'verification' | 'certificate';
  service_type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  logo_url?: string;
  verified: boolean;
  created_at: string;
}