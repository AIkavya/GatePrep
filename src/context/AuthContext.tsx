import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser, getStoredToken, getStoredUser, clearStoredAuth } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate session on startup
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.me();
        setUser(res.user);
        setToken(storedToken);
      } catch (err) {
        console.warn('Stored token is invalid or expired:', err);
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.auth.login(username, password);
      setUser(res.user);
      setToken(res.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.auth.register(username, password);
      setUser(res.user);
      setToken(res.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    const guestUser: AuthUser = { id: 'guest_aspirant', username: 'Guest Aspirant' };
    const guestToken = 'guest_token_' + Date.now();
    setUser(guestUser);
    setToken(guestToken);
    setError(null);
    localStorage.setItem('gate_prep_jwt_token', guestToken);
    localStorage.setItem('gate_prep_user_profile', JSON.stringify(guestUser));
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        continueAsGuest,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
