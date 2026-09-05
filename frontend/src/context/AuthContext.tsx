import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('demo-auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem('demo-auth', JSON.stringify(authState));
  }, [authState]);

  const login = (user: User) => setAuthState({ user, isAuthenticated: true });
  const signup = (user: User) => setAuthState({ user, isAuthenticated: true });
  const logout = () => setAuthState({ user: null, isAuthenticated: false });

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
