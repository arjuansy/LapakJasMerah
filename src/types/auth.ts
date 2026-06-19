export type UserRole = 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  faculty: string | null;
  major: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
}
