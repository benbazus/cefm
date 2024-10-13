import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyTwoFactor: (email: string, token: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  confirmEmail: (token: string) => Promise<boolean>;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<boolean>;
}

interface User {
  email: string;
  token: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authApi.verifyToken(token);
          if (response.data.valid) {
            setUser({ email: response.data.email, token });
            await fetchProfile();
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          await logout();
        }
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser({ email, token: accessToken });
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const verifyTwoFactor = async (email: string, token: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyTwoFactor(email, token);
      return response.data.success;
    } catch (error) {
      console.error('Two-factor verification error:', error);
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await authApi.requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      await authApi.resetPassword(token, newPassword);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const confirmEmail = async (token: string): Promise<boolean> => {
    try {
      await authApi.confirmEmail(token);
      return true;
    } catch (error) {
      console.error('Email confirmation error:', error);
      return false;
    }
  };

  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      await logout();
    }
  };

  const updateProfile = async (updatedProfile: Partial<Profile>): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile(updatedProfile);
      setProfile(response.data);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    login,
    logout,
    verifyTwoFactor,
    requestPasswordReset,
    resetPassword,
    confirmEmail,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};