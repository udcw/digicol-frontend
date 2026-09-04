// lib/api.ts - Version Supabase

import { supabase } from './supabase';

// ============================================
// AUTHENTIFICATION (via Supabase)
// ============================================
export const auth = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  register: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  profile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return { data, error };
    }
    return { data: null, error: new Error('Non connecté') };
  },
};

// ============================================
// COURSES
// ============================================
export const courses = {
  list: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, category:categories(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (slug: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, category:categories(*), instructor:users(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    return { data, error };
  },
  
  categories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    return { data, error };
  },
};

// ============================================
// PROJECTS
// ============================================
export const projects = {
  list: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (id: number) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// ============================================
// EVENTS
// ============================================
export const events = {
  list: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (id: number) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// ============================================
// BLOG
// ============================================
export const blog = {
  list: async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (id: number) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    return { data, error };
  },
};

// ============================================
// OPPORTUNITIES
// ============================================
export const opportunities = {
  list: async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (id: number) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// ============================================
// CERTIFICATES
// ============================================
export const certificates = {
  list: async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  detail: async (id: number) => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// ============================================
// MEMBERS
// ============================================
export const members = {
  profile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Non connecté') };
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return { data, error };
  },
  
  update: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Non connecté') };
    }
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    return { data: updated, error };
  },
};

// ============================================
// UTILITAIRES
// ============================================
export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  const role = data?.role || 'MEMBRE';
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

export const getAccessToken = (): string | null => {
  // Récupérer le token depuis Supabase
  // Le token est géré automatiquement par Supabase
  return null; // Supabase gère ça automatiquement
};

export const redirectToAdminLogin = () => {
  window.location.href = '/admin/login';
};

// Exporter par défaut
export default {
  auth,
  members,
  courses,
  projects,
  events,
  blog,
  opportunities,
  certificates,
  isAdmin,
  getAccessToken,
  redirectToAdminLogin,
};