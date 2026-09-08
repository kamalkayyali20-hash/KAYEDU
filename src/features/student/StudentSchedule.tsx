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
  CheckCircle2,
  AlertCircle,
  Building,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  BookOpen,
  Check,
  ChevronRight
} from 'lucide-react';
import { QRDisplayModal } from '../../components/common/QRDisplayModal';
import { PaymentModal } from '../../components/common/PaymentModal';

export const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [filterMode, setFilterMode] = useState<'joined' | 'all'>('joined');
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

  // Determine user enrollments
  const userEnrollments = enrollments.filter(e => e.studentId === (user?.id || 'user_student_1'));
  const userEnrolledSessionIds = new Set(userEnrollments.map(e => e.sessionId));

  // If viewing 'joined', default to sessions where user has an enrollment or demo joined sessions
  // Ensure the primary center sessions are in user's joined set for rich demo experience
  const displayedSessions = sessions.filter(s => {
    // Center filter
    if (selectedCenterFilter !== 'all' && s.centerId !== selectedCenterFilter) {
      return false;
    }
    // Filter mode: joined classes vs all
    if (filterMode === 'joined') {
      return userEnrolledSessionIds.has(s.id) || s.id === 'sess_phy_today' || s.id === 'sess_60_1' || s.id === 'sess_mod_1' || s.id === 'sess_60_2';
    }
    // When in 'all' mode, filter by student's grade
    if (user?.grade && s.grade !== user.grade) {
      return false;
    }
    return true;
  });

  // Group sessions by Date
  const groupedByDate: Record<string, Session[]> = {};
  displayedSessions.forEach(sess => {
    const dateKey = sess.date || '2026-09-08';
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(sess);
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedByDate).sort();

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === '2026-09-08') {
      return language === 'ar' ? 'اليوم — الثلاثاء 8 سبتمبر 2026' : 'Today — Tuesday, Sep 8, 2026';
    }
    if (dateStr === '2026-09-09') {
      return language === 'ar' ? 'غداً — الأربعاء 9 سبتمبر 2026' : 'Tomorrow — Wednesday, Sep 9, 2026';
    }
    if (dateStr === '2026-09-10') {
      return language === 'ar' ? 'الخميس 10 سبتمبر 2026' : 'Thursday, Sep 10, 2026';
    }
    if (dateStr === '2026-09-12') {
      return language === 'ar' ? 'السبت 12 سبتمبر 2026' : 'Saturday, Sep 12, 2026';
    }
    if (dateStr === '2026-09-14') {
      return language === 'ar' ? 'الاثنين 14 سبتمبر 2026' : 'Monday, Sep 14, 2026';
    }
    return dateStr;
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ar' ? 'جدول الحصص الأكاديمي' : 'Academic Class Schedule'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'الحصص التي انضممت إليها مرتبة بالتواريخ في سنتر 60 وسنتر مودرن'
              : 'Classes you joined, organized by date across Center 60 & Center Modern'}
          </p>
        </div>

        {/* View Mode Toggle: Joined vs All */}
        <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl text-xs font-bold self-start">
          <button
            onClick={() => setFilterMode('joined')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filterMode === 'joined'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'حصصي المشترك بها' : 'My Joined Classes'}</span>
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'ar' ? 'جميع الحصص المتاحة' : 'All Classes'}
          </button>
        </div>
      </div>

      {/* Center Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCenterFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            selectedCenterFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('all')} Centers (الكل)
        </button>
        <button
          onClick={() => setSelectedCenterFilter('center_60')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedCenterFilter === 'center_60'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>Center 60 (سنتر 60 - مدينة نصر)</span>
        </button>
        <button
          onClick={() => setSelectedCenterFilter('center_modern')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedCenterFilter === 'center_modern'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>Center Modern (سنتر مودرن - المهندسين)</span>
        </button>
      </div>

      {/* Date-Grouped Sessions List */}
      {sortedDates.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {language === 'ar' ? 'لا توجد حصص مجدولة لهذا الاختيار' : 'No classes found for this filter'}
          </p>
          <button
            onClick={() => {
              setFilterMode('all');
              setSelectedCenterFilter('all');
            }}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow"
          >
            {language === 'ar' ? 'عرض جميع الحصص' : 'View All Available Classes'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dateSessions = groupedByDate[dateStr];
            const isToday = dateStr === '2026-09-08';

            return (
              <div key={dateStr} className="space-y-3">
                {/* Date Header Pill */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-2 ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateLabel(dateStr)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    ({dateSessions.length} {language === 'ar' ? 'حصص' : 'classes'})
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Session cards for this date */}
                <div className="grid grid-cols-1 gap-3">
                  {dateSessions.map((session) => {
                    const isJoined = userEnrolledSessionIds.has(session.id) ||
                      session.id === 'sess_phy_today' ||
                      session.id === 'sess_60_1' ||
                      session.id === 'sess_mod_1' ||
                      session.id === 'sess_60_2';

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

                    return (
                      <div
                        key={session.id}
                        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex flex-col items-center justify-center font-mono shrink-0 shadow-sm">
                              <span className="text-xs font-black">{session.startTime}</span>
                              <span className="text-[9px] opacity-75">{session.endTime}</span>
                            </div>

                            <img
                              src={session.teacherAvatar}
                              alt={session.teacherName}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                  {session.subject} — {language === 'ar' ? session.teacherNameAr || session.teacherName : session.teacherName}
                                </h3>
                                {isJoined && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                    {language === 'ar' ? 'مشترك' : 'Joined'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                                {session.groupName} • {session.grade}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{session.centerName} • {session.room}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isPaid ? t('paid') : t('unpaid')}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {session.priceEgp} EGP
                            </span>
                          </div>
                        </div>

                        {/* Actions bar for joined sessions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{session.enrolledCount || 24}/{session.capacity} {language === 'ar' ? 'طالب' : 'students'}</span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{session.isOnline ? 'Online' : 'In-Center (حضوري)'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveQRModalSession({ session, enrollment })}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>{t('showQR')}</span>
                            </button>

                            {!isPaid && (
                              <button
                                onClick={() => setActivePaymentModalSession({ session, enrollment })}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{t('payOnline')}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {activeQRModalSession && (
        <QRDisplayModal
          session={activeQRModalSession.session}
          enrollment={activeQRModalSession.enrollment}
          student={user!}
          onClose={() => setActiveQRModalSession(null)}
          onPayOnline={() => {
            const current = activeQRModalSession;
            setActiveQRModalSession(null);
            setActivePaymentModalSession(current);
          }}
        />
      )}

      {activePaymentModalSession && (
        <PaymentModal
          session={activePaymentModalSession.session}
          enrollment={activePaymentModalSession.enrollment}
          onClose={() => setActivePaymentModalSession(null)}
          onPaymentSuccess={() => {
            const current = activePaymentModalSession;
            setActivePaymentModalSession(null);
            setActiveQRModalSession(current);
          }}
        />
      )}
    </div>
  );
};
