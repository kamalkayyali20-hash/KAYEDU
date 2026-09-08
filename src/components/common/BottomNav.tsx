import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Compass,
  Calendar,
  BookOpen,
  User,
  Users,
  Briefcase,
  DollarSign,
  QrCode,
  Building,
  TrendingUp,
  FileText,
  ShieldCheck,
  Award
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { role } = useAuth();
  const { t, language } = useLanguage();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    highlight?: boolean;
  }

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'explore', label: t('navExplore'), icon: Compass },
          { id: 'schedule', label: t('navSchedule'), icon: Calendar },
          { id: 'learning', label: t('navLearning'), icon: BookOpen },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      case 'teacher':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'schedule', label: t('navSchedule'), icon: Calendar },
          { id: 'students', label: t('navStudents'), icon: Users },
          { id: 'teaching', label: t('navTeaching'), icon: Briefcase },
          { id: 'earnings', label: t('navEarnings'), icon: DollarSign },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      case 'center_staff':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'scan_qr', label: language === 'ar' ? 'مسح QR' : 'Scan QR', icon: QrCode, highlight: true },
          { id: 'schedule', label: t('navSchedule'), icon: Calendar },
          { id: 'students', label: t('navStudents'), icon: Users },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      case 'center_owner':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'operations', label: t('navOperations'), icon: Building },
          { id: 'finance', label: t('navFinance'), icon: DollarSign },
          { id: 'people', label: t('navPeople'), icon: Users },
          { id: 'reports', label: t('navReports'), icon: FileText },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      case 'parent':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'children', label: t('navChildren'), icon: Users },
          { id: 'schedule', label: t('navSchedule'), icon: Calendar },
          { id: 'progress', label: t('navProgress'), icon: TrendingUp },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      case 'super_admin':
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'centers', label: language === 'ar' ? 'المراكز' : 'Centers', icon: Building },
          { id: 'subscriptions', label: language === 'ar' ? 'الاشتراكات' : 'Subscriptions', icon: Award },
          { id: 'audit', label: language === 'ar' ? 'سجل الرقابة' : 'Audit Logs', icon: ShieldCheck },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
      default:
        return [
          { id: 'home', label: t('navHome'), icon: Home },
          { id: 'profile', label: t('navProfile'), icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-active:scale-95 transition-all">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative p-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute bottom-0 inset-x-1 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] leading-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
