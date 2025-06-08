import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setUserId, clearUserId, trackEvent } from '../utils/analytics';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to clear demo data when user authenticates
function clearDemoData() {
  // Get session ID
  const sessionId = sessionStorage.getItem('recruiter_session_id');
  if (sessionId) {
    const demoKey = `demo_recruiter_data_${sessionId}`;
    localStorage.removeItem(demoKey);
    console.log('🧹 Cleared demo data for authenticated user');
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : '/api';

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            // Set user ID in analytics
            setUserId(data.user.id);
            // Clear demo data since user is authenticated
            clearDemoData();
          } else {
            localStorage.removeItem('token');
            clearUserId();
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          clearUserId();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      clearUserId();
    }
  }, [API_BASE]);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    
    // Set user ID in analytics
    setUserId(data.user.id);
    
    // Track login event
    trackEvent('user_login', { 
      userId: data.user.id, 
      email: data.user.email 
    });
    
    // Clear demo data since user is now authenticated
    clearDemoData();
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    
    // Set user ID in analytics
    setUserId(data.user.id);
    
    // Track signup event
    trackEvent('user_signup', { 
      userId: data.user.id, 
      email: data.user.email,
      name: data.user.name 
    });
    
    // Clear demo data since user is now authenticated
    clearDemoData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    
    // Clear user ID from analytics
    clearUserId();
    
    // Track logout event
    trackEvent('user_logout');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 