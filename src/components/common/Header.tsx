import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Role } from '../../types';
import {
  Bell,
  Sun,
  Moon,
  Globe,
  UserCheck,
  ChevronDown,
  Building2,
  Sparkles,
  LogOut,
  Layers
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenNotifications }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifications = storageService.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<Role, { en: string; ar: string; color: string }> = {
    student: { en: 'Student', ar: 'طالب', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    teacher: { en: 'Teacher', ar: 'مدرس', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    center_staff: { en: 'Reception / Staff', ar: 'استقبال / موظف', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    center_owner: { en: 'Center Owner', ar: 'مالك المركز', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    parent: { en: 'Parent', ar: 'ولي أمر', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
    super_admin: { en: 'Super Admin', ar: 'مدير النظام', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };

  const currentRoleMeta = roleLabels[role] || roleLabels.student;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand or Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center text-white font-black tracking-wider text-sm shadow-sm shrink-0">
            K
          </div>
          <div className="min-w-0">
            {title ? (
              <div className="truncate">
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    KAYEDU
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                    PROTOTYPE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                  {t('appTagline')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Role Switcher Pill for Demo */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${currentRoleMeta.color}`}
              title="Fast Role Switcher"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'ar' ? currentRoleMeta.ar : currentRoleMeta.en}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div
                className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'ar' ? 'تبديل الدور للتجربة' : 'Switch Role Experience'}
                </div>
                {(Object.keys(roleLabels) as Role[]).map((rKey) => (
                  <button
                    key={rKey}
                    onClick={() => {
                      switchRole(rKey);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-start flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      role === rKey
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{language === 'ar' ? roleLabels[rKey].ar : roleLabels[rKey].en}</span>
                    {role === rKey && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          {user && (
            <div className="relative group">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer"
                title={`${user.name} (${role})`}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
