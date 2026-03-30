import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const userResponse = await supabase.auth.getUser();
  if (userResponse.error) throw userResponse.error;
  return userResponse.data.user;
}

export async function getCurrentSession() {
  const sessionResponse = await supabase.auth.getSession();
  if (sessionResponse.error) throw sessionResponse.error;
  return sessionResponse.data.session;
}
