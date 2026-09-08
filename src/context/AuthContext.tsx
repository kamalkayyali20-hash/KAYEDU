import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services';
import { DEMO_USERS } from '../services/mockData';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: (demoRole: Role) => Promise<void>;
  switchRole: (newRole: Role) => void;
  updateUser: (updates: Partial<User>) => void;
  registerUser: (userData: Partial<User>) => void;
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

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    storageService.updateUser(user.id, updates);
  };

  const registerUser = (userData: Partial<User>) => {
    const id = `user_${userData.role || 'student'}_${Date.now()}`;
    const newUser: User = {
      id,
      name: userData.name || 'New User',
      nameAr: userData.nameAr || userData.name || 'مستخدم جديد',
      email: userData.email || `${id}@kayedu.demo`,
      phone: userData.phone || '+20 100 000 0000',
      role: userData.role || 'student',
      avatarUrl: userData.avatarUrl || (userData.role === 'teacher'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'),
      primaryCenterId: userData.primaryCenterId || 'center_60',
      centerIds: userData.centerIds || ['center_60', 'center_modern'],
      grade: userData.grade || 'Grade 11',
      educationSystem: userData.educationSystem || 'Thanaweya Amma',
      subjects: userData.subjects || ['Physics'],
      grades: userData.grades || ['Grade 10', 'Grade 11', 'Grade 12'],
      bio: userData.bio || '',
      rating: userData.rating || 4.8,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    storageService.saveUser(newUser);
    setUser(newUser);
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
        updateUser,
        registerUser,
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
