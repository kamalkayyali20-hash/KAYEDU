import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import {
  X,
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  BookOpen,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const notifications = storageService.getNotifications();

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsRead();
    // Force re-render if needed
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'class_reminder':
      case 'schedule_changed':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'payment_due':
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'homework':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'exam':
        return <FileCheck className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-s border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('navNotifications')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="p-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">{t('noNotifications')}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.read
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 opacity-75'
                    : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {language === 'ar' ? n.titleAr : n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {language === 'ar' ? n.messageAr : n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
