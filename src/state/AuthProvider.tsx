import React, { createContext, useContext } from 'react';
import { useAuthService, AuthContextType } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authService = useAuthService();

  return (
    <AuthContext.Provider value={authService}>
      {children}
    </AuthContext.Provider>
  );
};
