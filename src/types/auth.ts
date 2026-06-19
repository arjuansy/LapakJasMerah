export type UserRole = 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  nim: string | null;
  role: UserRole;
  faculty: string | null;
  major: string | null;
  angkatan: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  is_verified_seller: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
}
