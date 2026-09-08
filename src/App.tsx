import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './features/auth/LoginView';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Role Features
import { StudentHome } from './features/student/StudentHome';
import { StudentExplore } from './features/student/StudentExplore';
import { StudentSchedule } from './features/student/StudentSchedule';
import { StudentLearning } from './features/student/StudentLearning';
import { TeacherHome } from './features/teacher/TeacherHome';
import { ParentDashboard } from './features/parent/ParentDashboard';
import { StaffReceptionView } from './features/staff/StaffReceptionView';
import { CenterOwnerDashboard } from './features/owner/CenterOwnerDashboard';
import { SuperAdminDashboard } from './features/admin/SuperAdminDashboard';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // If not signed in, show the comprehensive Login view
  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  // Render role-specific views
  const renderContent = () => {
    switch (user.role) {
      case 'student':
        if (activeTab === 'explore') return <StudentExplore />;
        if (activeTab === 'schedule') return <StudentSchedule />;
        if (activeTab === 'learning') return <StudentLearning />;
        return <StudentHome onNavigateTab={setActiveTab} />;

      case 'teacher':
        if (activeTab === 'schedule') return <StudentSchedule />;
        if (activeTab === 'learning') return <StudentLearning />;
        return <TeacherHome onNavigateTab={setActiveTab} />;

      case 'parent':
        if (activeTab === 'schedule') return <StudentSchedule />;
        if (activeTab === 'learning') return <StudentLearning />;
        return <ParentDashboard />;

      case 'center_staff':
        if (activeTab === 'schedule') return <StudentSchedule />;
        return <StaffReceptionView />;

      case 'center_owner':
        if (activeTab === 'reception') return <StaffReceptionView />;
        if (activeTab === 'schedule') return <StudentSchedule />;
        return <CenterOwnerDashboard />;

      case 'super_admin':
        if (activeTab === 'explore') return <StudentExplore />;
        if (activeTab === 'owner') return <CenterOwnerDashboard />;
        return <SuperAdminDashboard />;

      default:
        return <StudentHome onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header onOpenNotifications={() => setShowNotificationDrawer(true)} />

      {/* Main Responsive Content Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-12">
        {renderContent()}
      </main>

      {/* Role-Aware Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Notifications Drawer */}
      {showNotificationDrawer && (
        <NotificationDrawer onClose={() => setShowNotificationDrawer(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
