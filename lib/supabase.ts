// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fctjyzejpmxulxizkzoo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdGp5emVqcG14dWx4aXprem9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDI0ODgsImV4cCI6MjEwMzkxODQ4OH0.nAXB-cgtkEDeiyVBGx9qhN7f6LqEN1cUf48mB7faNQM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonctions d'authentification
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};