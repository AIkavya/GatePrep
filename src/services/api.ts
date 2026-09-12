export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

const TOKEN_KEY = 'gate_prep_jwt_token';
const USER_KEY = 'gate_prep_auth_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new Error('Network connection failed. Please check your connection or server status.');
  }

  let data: any = {};
  const responseText = await response.text();
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText.slice(0, 150) };
    }
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Server error (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    register: async (username: string, password: string): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setStoredToken(res.token, res.user);
      return res;
    },

    login: async (username: string, password: string): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setStoredToken(res.token, res.user);
      return res;
    },

    me: async (): Promise<{ user: AuthUser }> => {
      return request<{ user: AuthUser }>('/api/auth/me');
    },

    guest: async (): Promise<AuthResponse> => {
      try {
        const res = await request<AuthResponse>('/api/auth/guest', {
          method: 'POST',
        });
        setStoredToken(res.token, res.user);
        return res;
      } catch (err) {
        // Fallback for offline guest token creation
        const guestUser: AuthUser = { id: 'guest_aspirant', username: 'Guest Aspirant' };
        const guestToken = 'guest_token_permanent';
        setStoredToken(guestToken, guestUser);
        return { token: guestToken, user: guestUser };
      }
    },

    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore logout network errors and clean local state
      } finally {
        clearStoredAuth();
      }
    },
  },

  study: {
    getData: async (): Promise<any> => {
      return request<any>('/api/gate/data');
    },

    saveData: async (data: any): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>('/api/gate/data', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    resetData: async (): Promise<any> => {
      return request<any>('/api/gate/reset', {
        method: 'POST',
      });
    },

    importTemplate: async (): Promise<any> => {
      return request<any>('/api/gate/import-template', {
        method: 'POST',
      });
    },
  },
};
