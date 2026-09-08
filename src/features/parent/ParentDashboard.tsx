import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Session, StudentSessionEnrollment } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { PaymentModal } from '../../components/common/PaymentModal';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Two children as required by Journey 3:
  // Child 1: Ahmed Mohamed (Grade 11 - Thanaweya Amma)
  // Child 2: Nour Mohamed (Grade 8 - Prep 2)
  const children = [
    {
      id: 'child_ahmed',
      studentId: 'user_student_1',
      name: 'Ahmed Mohamed',
      grade: 'Grade 11 (Thanaweya Amma)',
      school: 'Orman Secondary School',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      attendanceRate: '88.5%',
      standing: 'Needs Attention',
      standingReason: 'Attendance dropped to 72% in Physics; 2 homework assignments missing.',
      nextSessionId: 'sess_phy_today'
    },
    {
      id: 'child_nour',
      studentId: 'user_student_nour',
      name: 'Nour Mohamed',
      grade: 'Grade 8 (Prep 2)',
      school: 'Al-Rowad Language School',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      attendanceRate: '96.2%',
      standing: 'Excellent',
      standingReason: 'Consistent 100% homework submission and regular center attendance.',
      nextSessionId: 'sess_chem_nour'
    }
  ];

  const [selectedChildId, setSelectedChildId] = useState<string>('child_ahmed');
  const activeChild = children.find(c => c.id === selectedChildId) || children[0];

  const sessions = storageService.getSessions();
  const enrollments = storageService.getEnrollments();

  // Active child's next session
  const childSession = sessions.find(s => s.id === activeChild.nextSessionId) || sessions[0];
  const childEnrollment = enrollments.find(e => e.sessionId === childSession.id) || {
    id: `enr_${childSession.id}`,
    sessionId: childSession.id,
    studentId: activeChild.studentId,
    studentName: activeChild.name,
    studentCode: 'ST-001245',
    studentAvatar: activeChild.avatar,
    paymentStatus: selectedChildId === 'child_ahmed' ? 'PENDING' : 'PAID',
    reservationStatus: 'CONFIRMED'
  } as StudentSessionEnrollment;

  const isPaid = childEnrollment.paymentStatus === 'PAID';
  const isPresent = childEnrollment.attendanceStatus === 'PRESENT';

  const [showPayModal, setShowPayModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [parentNote, setParentNote] = useState('');
  const [noteSentSuccess, setNoteSentSuccess] = useState(false);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Parent Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('parentWelcome')}, {user?.name.split(' ')[0] || 'Mohamed'} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'متابعة الحضور والمدفوعات والدرجات المدرسية لأبنائك'
              : 'Monitor attendance check-ins, settle center dues, and track academic results.'}
          </p>
        </div>

        {/* Child Selector Tabs (Journey 3) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl self-start">
          {children.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChildId(ch.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedChildId === ch.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <img
                src={ch.avatar}
                alt={ch.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{ch.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Child Info Badge */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={activeChild.avatar}
            alt={activeChild.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {activeChild.name}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              {activeChild.grade} • {activeChild.school}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Attendance Record: <strong className="text-slate-700 dark:text-slate-200">{activeChild.attendanceRate}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowContactModal(true)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('contactCenter')}</span>
        </button>
      </div>

      {/* Real-time Check-In Notification Banner (Section 42 & Journey 3) */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
              {language === 'ar' ? 'إشعار حضور فوري' : 'Live Gate Check-In Confirmed'}
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              {activeChild.name} scanned attendance QR at KAYEDU Demo Center (5:58 PM).
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          Just now
        </span>
      </div>

      {/* Today's Class & Settle Payment Card (Journey 3) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('todaysSchedule')}
            </h4>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isPaid ? t('paid') : t('unpaid')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {childSession.subject} — {childSession.teacherName}
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {childSession.centerName} • Room {childSession.room} • {childSession.startTime}
            </p>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              Fee: {childSession.priceEgp} EGP
            </p>
          </div>

          {!isPaid ? (
            <button
              onClick={() => setShowPayModal(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('payOnline')} ({childSession.priceEgp} EGP)</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settled Online
            </span>
          )}
        </div>
      </div>

      {/* Transparent Performance Status (Section 27 & Journey 3) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('performanceStatus')}
            </span>
            <h4
              className={`text-lg font-black mt-0.5 ${
                activeChild.standing === 'Needs Attention'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {activeChild.standing}
            </h4>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              activeChild.standing === 'Needs Attention'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
            }`}
          >
            {activeChild.standing === 'Needs Attention' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Concrete Explanation Reasons */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            {t('statusReasons')}:
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeChild.standingReason}
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <PaymentModal
          session={childSession}
          enrollment={childEnrollment}
          onClose={() => setShowPayModal(false)}
          onPaymentSuccess={() => {
            setShowPayModal(false);
          }}
        />
      )}

      {/* Direct Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Message Center Administration
            </h4>
            <p className="text-xs text-slate-500">
              Send a note regarding {activeChild.name} to KAYEDU Demo Center management.
            </p>
            {noteSentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold">Message Delivered to Reception Desk!</p>
                <button
                  onClick={() => { setShowContactModal(false); setNoteSentSuccess(false); }}
                  className="py-1.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={parentNote}
                  onChange={e => setParentNote(e.target.value)}
                  placeholder="e.g. Please note Ahmed will arrive 10 minutes late today due to school bus delay..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setNoteSentSuccess(true)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
