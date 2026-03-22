import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper types for the database
export type Profile = {
  id: string;
  email: string;
  stripe_customer_id?: string;
  plan_status: 'active' | 'trialing' | 'canceled' | 'none' | 'admin';
  is_lifetime: boolean;
  name?: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
};

export type Prompt = {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  content: string;
  is_nsfw: boolean;
  preview_image?: string;
  created_at: string;
};

export type AcademyModule = {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  order_index: number;
  created_at: string;
};

export type AcademyLesson = {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  video_url?: string;
  file_url?: string;
  file_name?: string;
  image_url?: string;
  duration?: string;
  type: 'video' | 'file' | 'image';
  order_index: number;
  created_at: string;
};

export type Tool = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  link: string;
  category?: string;
  is_hot: boolean;
  image_url?: string;
  created_at: string;
};
