import { supabase } from '../config/supabaseClient';

export const authService = {
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
  }
};
