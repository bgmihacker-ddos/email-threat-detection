import { User } from '../types/auth';

// Mock authentication
export const mockLogin = async (email: string, password: string): Promise<{ user: User, token: string } | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === 'analyst@demo.local' && password === 'demo123') {
    return {
      user: { id: '1', email: 'analyst@demo.local', name: 'Security Analyst', role: 'user' },
      token: 'mock-jwt-token'
    };
  }

  if (normalizedEmail === 'admin@demo.local' && password === 'admin123') {
    return {
      user: { id: '2', email: 'admin@demo.local', name: 'Admin User', role: 'admin' },
      token: 'mock-admin-token'
    };
  }

  return null;
};
