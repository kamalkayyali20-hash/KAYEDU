import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services';
import { DEMO_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: (demoRole: Role) => Promise<void>;
  switchRole: (newRole: Role) => void;
  logout: () => void;
  primaryCenterId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // default to student demo so the app is instantly exploratory, or null if splash
    return authService.getCurrentUser();
  });

  const isAuthenticated = !!user;
  const role: Role = user?.role || 'student';
  const primaryCenterId = user?.primaryCenterId || 'center_kayedu';

  useEffect(() => {
    if (user) {
      authService.setCurrentUser(user);
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const loggedUser = await authService.login(email, pass);
    setUser(loggedUser);
  };

  const loginAsDemo = async (demoRole: Role) => {
    const demoUser = DEMO_USERS[demoRole] || DEMO_USERS.student;
    setUser(demoUser);
  };

  const switchRole = (newRole: Role) => {
    const targetUser = DEMO_USERS[newRole];
    if (targetUser) {
      setUser(targetUser);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginAsDemo,
        switchRole,
        logout,
        primaryCenterId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
