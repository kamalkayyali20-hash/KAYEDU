import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Session, StudentSessionEnrollment } from '../../types';
import {
  Calendar,
  Clock,
  DoorOpen,
  CreditCard,
  QrCode,
  Video,
  CheckCircle2,
  AlertCircle,
  Building,
  Filter,
  Layers
} from 'lucide-react';
import { QRDisplayModal } from '../../components/common/QRDisplayModal';
import { PaymentModal } from '../../components/common/PaymentModal';

export const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'all'>('week');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<string>('all');

  const sessions = storageService.getSessions();
  const enrollments = storageService.getEnrollments();

  const [activeQRModalSession, setActiveQRModalSession] = useState<{
    session: Session;
    enrollment: StudentSessionEnrollment;
  } | null>(null);

  const [activePaymentModalSession, setActivePaymentModalSession] = useState<{
    session: Session;
    enrollment: StudentSessionEnrollment;
  } | null>(null);

  const filteredSessions = sessions.filter(s => {
    if (selectedCenterFilter !== 'all' && s.centerId !== selectedCenterFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('navSchedule')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'جدول الحصص الموحد عبر جميع السناتر والمراكز التعليمية'
              : 'Unified schedule across all your connected education centers'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold self-start">
          {(['day', 'week', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Center Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCenterFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            selectedCenterFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('all')} Centers
        </button>
        <button
          onClick={() => setSelectedCenterFilter('center_kayedu')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            selectedCenterFilter === 'center_kayedu'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          KAYEDU Demo Center (Dokki)
        </button>
        <button
          onClick={() => setSelectedCenterFilter('center_future')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            selectedCenterFilter === 'center_future'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Future Academy (Nasr City)
        </button>
      </div>

      {/* Sessions Timeline Cards */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const enrollment = enrollments.find(
            e => e.sessionId === session.id && e.studentId === (user?.id || 'user_student_1')
          ) || {
            id: `enr_${session.id}`,
            sessionId: session.id,
            studentId: user?.id || 'user_student_1',
            studentName: user?.name || 'Ahmed Mohamed',
            studentCode: 'ST-001245',
            studentAvatar: user?.avatarUrl || '',
            paymentStatus: session.id === 'sess_phy_today' ? 'PENDING' : 'PAID',
            reservationStatus: 'CONFIRMED'
          } as StudentSessionEnrollment;

          const isPaid = enrollment.paymentStatus === 'PAID';
          const isPresent = enrollment.attendanceStatus === 'PRESENT';

          return (
            <div
              key={session.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex flex-col items-center justify-center font-mono shrink-0">
                    <span className="text-xs font-black">{session.startTime}</span>
                    <span className="text-[9px] opacity-75">{session.endTime}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {session.subject} — {session.teacherName}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {session.groupName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3" />
                      <span>{session.centerName} • {session.room}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isPaid ? t('paid') : t('unpaid')}
                  </span>
                  {isPresent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {t('present')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {session.priceEgp} EGP
                </div>

                <div className="flex items-center gap-2">
                  {session.isOnline && (
                    <a
                      href={session.onlineMeetingUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-purple-700"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('joinOnlineSession')}</span>
                    </a>
                  )}

                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => setActivePaymentModalSession({ session, enrollment })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t('payOnline')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveQRModalSession({ session, enrollment })}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t('showQR')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {activeQRModalSession && (
        <QRDisplayModal
          session={activeQRModalSession.session}
          enrollment={activeQRModalSession.enrollment}
          student={user!}
          onClose={() => setActiveQRModalSession(null)}
          onPayOnline={() => {
            setActivePaymentModalSession(activeQRModalSession);
            setActiveQRModalSession(null);
          }}
        />
      )}

      {/* Payment Modal */}
      {activePaymentModalSession && (
        <PaymentModal
          session={activePaymentModalSession.session}
          enrollment={activePaymentModalSession.enrollment}
          onClose={() => setActivePaymentModalSession(null)}
          onPaymentSuccess={() => {
            setActivePaymentModalSession(null);
          }}
        />
      )}
    </div>
  );
};
