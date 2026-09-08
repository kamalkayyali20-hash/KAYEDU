import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Session, StudentSessionEnrollment } from '../../types';
import {
  Calendar,
  Clock,
  DoorOpen,
  Users,
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Building,
  PlusCircle,
  FilePlus,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { AIAssistantModal } from './AIAssistantModal';
import { CreateHomeworkModal } from './CreateHomeworkModal';
import { CreateSessionModal } from './CreateSessionModal';

interface TeacherHomeProps {
  onNavigateTab: (tab: string) => void;
  onOpenSessionRoster?: (session: Session) => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ onNavigateTab, onOpenSessionRoster }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [refreshKey, setRefreshKey] = useState(0);

  const sessions = storageService.getSessions().filter(s => s.teacherId === (user?.id || 'user_teacher_1'));
  const allSessions = storageService.getSessions();
  const enrollments = storageService.getEnrollments();
  const settlements = storageService.getSettlements().filter(s => s.teacherId === (user?.id || 'user_teacher_1'));

  const [showAIModal, setShowAIModal] = useState(false);
  const [showCreateHwModal, setShowCreateHwModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [activeRosterSession, setActiveRosterSession] = useState<Session | null>(null);

  // Total students today across all centers
  const totalStudentsToday = sessions.reduce((sum, s) => sum + s.enrolledCount, 0);

  // Earnings summary
  const totalEarnedApproved = settlements.reduce((sum, s) => sum + (s.status === 'PAID' ? s.paidAmountEgp : s.teacherShareEgp), 0);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Teacher Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('goodMorning')}, {user?.name.split(' ')[1] || 'Mr. Ahmed'} ☕
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'مرحباً بك في منصة المعلم الموحدة عبر جميع السناتر'
              : 'Senior Physics Specialist • 3 Connected Educational Centers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateSessionModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة حصة / مجموعة' : 'Add Class / Session'}</span>
          </button>
          <span className="hidden sm:inline text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {t('verifiedTeacher')}
          </span>
        </div>
      </div>

      {/* Cross-Center Conflict Warning / Unified Schedule Notice (Section 30) */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-3 text-xs">
        <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
            {t('unifiedScheduleNotice')}
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
            {language === 'ar'
              ? 'أنت تدرّس حالياً في سنتر كاي إديو (الدقي) وسنتر أكاديمية المستقبل (مدينة نصر). لا توجد تعارضات في المواعيد اليوم.'
              : 'Synchronizing authorized sessions across KAYEDU Demo Center and Future Academy. No schedule overlaps detected.'}
          </p>
        </div>
      </div>

      {/* Metrics Row: Total Students Today, Earnings, Pending Grading */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('totalStudentsToday')}
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {totalStudentsToday}
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('pendingGrading')}
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            4
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'ar' ? 'المستحقات (EGP)' : 'Earnings'}
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {(totalEarnedApproved / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* AI Assistant Quick Hero Banner (Journey 6 hook) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-800/40 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t('aiAssistant')}
          </div>
          <h3 className="text-sm font-extrabold text-white">
            {t('digitizeWithAI')}
          </h3>
          <p className="text-[11px] text-slate-300 max-w-xs">
            {t('digitizeSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAIModal(true)}
          className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-colors shrink-0"
        >
          {language === 'ar' ? 'بدء الرقمنة' : 'Try AI Assistant'}
        </button>
      </div>

      {/* Today's Unified Sessions Timeline (Journey 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            {t('todaysSchedule')}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateSessionModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إضافة حصة' : '+ Add Class'}</span>
            </button>
            <button
              onClick={() => setShowCreateHwModal(true)}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إنشاء واجب' : 'New Homework'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {sessions.map((sess) => {
            const sessEnrollments = enrollments.filter(e => e.sessionId === sess.id);
            const presentCount = sessEnrollments.filter(e => e.attendanceStatus === 'PRESENT').length;

            return (
              <div
                key={sess.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {sess.startTime} - {sess.endTime}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {sess.groupName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{sess.centerName} • {sess.room}</span>
                    </p>
                  </div>

                  <div className="text-end">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                      {presentCount} / {sess.enrolledCount} Present
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Capacity: {sess.capacity}
                    </span>
                  </div>
                </div>

                {/* Session Actions for Teacher */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {sess.priceEgp} EGP / student
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRosterSession(sess)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'كشف الحضور والطلاب' : 'View Attendance Roster'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Roster & Attendance View Modal (Section 31, 32, 33) */}
      {activeRosterSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeRosterSession.groupName}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeRosterSession.centerName} • {activeRosterSession.room}
                </p>
              </div>
              <button
                onClick={() => setActiveRosterSession(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Enrolled Students ({enrollments.filter(e => e.sessionId === activeRosterSession.id).length})
              </span>

              {enrollments.filter(e => e.sessionId === activeRosterSession.id).map(enr => (
                <div
                  key={enr.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={enr.studentAvatar}
                      alt={enr.studentName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">
                        {enr.studentName}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {enr.studentCode} • {enr.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      enr.attendanceStatus === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {enr.attendanceStatus || 'Not Checked In'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveRosterSession(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* AI Teacher Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}

      {/* Create Homework Modal */}
      {showCreateHwModal && (
        <CreateHomeworkModal
          onClose={() => setShowCreateHwModal(false)}
          onPublished={() => setShowCreateHwModal(false)}
        />
      )}

      {/* Create Class / Session Modal */}
      {showCreateSessionModal && (
        <CreateSessionModal
          isOpen={showCreateSessionModal}
          onClose={() => setShowCreateSessionModal(false)}
          onSessionCreated={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};
