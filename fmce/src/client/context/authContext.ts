import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
 

// Define the shape of the AuthContext
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

// Define User and Profile types
interface User {
  email: string;
  token: string;
  // Add other user-related fields as necessary
}

interface Profile {
  id: string;
  name: string;
  email: string;
  // Add other profile-related fields as necessary
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Effect to check if user is logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Verify the token
          const response = await authApi.verifyToken(token);
          if (response.data.valid) {
            // Assuming response contains user email
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

  // Login function
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

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, proceed to clear local state
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  // Verify Two-Factor Authentication
  const verifyTwoFactor = async (email: string, token: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyTwoFactor(email, token);
      // Handle the response as needed, e.g., set additional user data
      return response.data.success;
    } catch (error) {
      console.error('Two-factor verification error:', error);
      return false;
    }
  };

  // Request Password Reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await authApi.requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  // Reset Password
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      await authApi.resetPassword(token, newPassword);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  // Confirm Email
  const confirmEmail = async (token: string): Promise<boolean> => {
    try {
      await authApi.confirmEmail(token);
      return true;
    } catch (error) {
      console.error('Email confirmation error:', error);
      return false;
    }
  };

  // Fetch User Profile
  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Optionally, you might want to logout the user if fetching profile fails
      await logout();
    }
  };

  // Update User Profile
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


  return (
    <AuthContext.Provider
      value={{
        user
    profile
    login
    logout
    verifyTwoFactor
    requestPasswordReset
    resetPassword
    confirmEmail
    updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )

  
}

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
