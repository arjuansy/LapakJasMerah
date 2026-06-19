import { supabase } from '../config/supabaseClient';

export const authService = {
  /**
   * Register a new user with Email and Password
   */
  async registerWithPassword(email: string, password: string, fullName?: string, nim?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          nim: nim || ''
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Login an existing user with Email and Password
   */
  async loginWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/marketplace'
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send an OTP to the user's email.
   * Supabase handles the rate limiting automatically (e.g., 3 emails per hour on free tier).
   */
  async sendOTP(email: string, fullName?: string, nim?: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName || '',
          nim: nim || ''
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send an OTP to the user's email for password recovery.
   */
  async sendPasswordResetOTP(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  /**
   * Verify the OTP sent to the user's email for password recovery.
   */
  async verifyPasswordResetOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update the user's password (must be logged in, or immediately after recovery).
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Verify the OTP sent to the user's email.
   */
  async verifyOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;
    return data;
  },

  /**
   * Verify the OTP sent to the user's email after password signup.
   */
  async verifySignupOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (error) throw error;
    return data;
  },

  /**
   * Logout the current user.
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Fetch the profile data for a given user ID from the public.profiles table.
   */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw error;
    }
    return data;
  },

  /**
   * Update the profile data for a given user ID from the public.profiles table.
   */
  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
