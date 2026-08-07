export interface AuthTokens {
  accessToken: string;
}

export interface SafeUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  profileImage: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}