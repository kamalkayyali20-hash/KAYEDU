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
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  BookOpen,
  FileCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { QRDisplayModal } from '../../components/common/QRDisplayModal';
import { PaymentModal } from '../../components/common/PaymentModal';

interface StudentHomeProps {
  onNavigateTab: (tab: string) => void;
  onSelectTeacher?: (teacherId: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ onNavigateTab, onSelectTeacher }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const sessions = storageService.getSessions();
  const enrollments = storageService.getEnrollments();
  const homeworkList = storageService.getHomework();
  const exams = storageService.getExams();
  const teachers = storageService.getTeachers();

  // Next session for student Ahmed
  const nextSession = sessions.find(s => s.id === 'sess_phy_today') || sessions[0];
  const nextEnrollment = enrollments.find(e => e.sessionId === nextSession.id && e.studentId === (user?.id || 'user_student_1')) || {
    id: 'enr_temp',
    sessionId: nextSession.id,
    studentId: user?.id || 'user_student_1',
    studentName: user?.name || 'Ahmed Mohamed',
    studentCode: 'ST-001245',
    studentAvatar: user?.avatarUrl || '',
    paymentStatus: 'PENDING',
    reservationStatus: 'CONFIRMED'
  } as StudentSessionEnrollment;

  // Active modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<Session | null>(null);

  const isPaid = nextEnrollment.paymentStatus === 'PAID';
  const isPresent = nextEnrollment.attendanceStatus === 'PRESENT';

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('goodEvening')}, {user?.name.split(' ')[0] || 'Ahmed'} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'لديك حصة مجدولة اليوم في سنتر كاي إديو (الدقي)'
              : "You have 1 class scheduled today at KAYEDU Demo Center"}
          </p>
        </div>
        <div className="text-end">
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Thanaweya Amma • G11
          </span>
        </div>
      </div>

      {/* Critical Next Class Card (Journey 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 end-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {t('nextClass')}
            </span>
            <span className="text-xs text-slate-400">• {t('today')}</span>
          </div>

          {/* Payment indicator badge */}
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
              isPaid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isPaid ? t('paid') : t('unpaid')}
          </span>
        </div>

        {/* Teacher & Session Info */}
        <div className="flex items-start gap-4">
          <img
            src={nextSession.teacherAvatar}
            alt={nextSession.teacherName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">
                {language === 'ar' ? nextSession.teacherNameAr || nextSession.teacherName : nextSession.teacherName}
              </h3>
              <span className="flex items-center text-amber-400 text-xs font-bold gap-0.5">
                <Star className="w-3 h-3 fill-amber-400" /> 4.74
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium">
              {nextSession.subject} • {nextSession.grade}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {nextSession.centerName} • {nextSession.branchName}
            </p>
          </div>
        </div>

        {/* Schedule & Location Pills */}
        <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Clock className="w-3 h-3 text-indigo-400" /> {t('time')}
            </div>
            <p className="font-bold text-white mt-1">6:00 PM</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <DoorOpen className="w-3 h-3 text-indigo-400" /> {t('room')}
            </div>
            <p className="font-bold text-white mt-1">{nextSession.room}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <CreditCard className="w-3 h-3 text-emerald-400" /> {t('price')}
            </div>
            <p className="font-bold text-emerald-400 mt-1">{nextSession.priceEgp} EGP</p>
          </div>
        </div>

        {/* Journey 1 Actions: View Session, Pay Online, Show QR */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>{t('showQR')}</span>
          </button>

          {!isPaid && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('payOnline')}</span>
            </button>
          )}

          <button
            onClick={() => setSelectedSessionForDetail(nextSession)}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition-colors"
          >
            {t('viewSession')}
          </button>
        </div>
      </div>

      {/* Today's Schedule Quick Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            {t('todaysSchedule')}
          </h3>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>{language === 'ar' ? 'عرض الكل' : 'View All'}</span>
            {language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-2">
          {sessions.slice(0, 2).map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSessionForDetail(s)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center text-[10px] font-bold">
                  <span>{s.startTime}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {s.subject} — {s.teacherName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {s.centerName} • {s.room}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {s.priceEgp} EGP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Homework & Exams Quick Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Homework Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                {t('upcomingHomework')}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold">
                1 Due Soon
              </span>
            </div>
            {homeworkList.slice(0, 1).map((hw) => (
              <div key={hw.id} className="mt-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {hw.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {hw.subject} • Due {hw.dueDate.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigateTab('learning')}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors text-center"
          >
            {language === 'ar' ? 'حل الواجبات' : 'Open Homework'}
          </button>
        </div>

        {/* Exams Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-rose-500" />
                {t('upcomingExams')}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 font-bold">
                Sep 15
              </span>
            </div>
            {exams.slice(0, 1).map((ex) => (
              <div key={ex.id} className="mt-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ex.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {ex.subject} • {ex.durationMinutes} mins • {ex.totalPoints} pts
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigateTab('learning')}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors text-center"
          >
            {language === 'ar' ? 'بدء الاختبار' : 'Take Exam'}
          </button>
        </div>
      </div>

      {/* Academic Standing / Progress Summary (Section 27) */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 rounded-2xl p-4 border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t('attendanceSummary')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                94% Good
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              15 of 16 attended • 0 unexcused absences this month
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('learning')}
          className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          title="View detailed progress"
        >
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>

      {/* Recommended Teachers (Section 16 / Journey 4 hook) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('recommendedTeachers')}
          </h3>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            {language === 'ar' ? 'استكشاف المعلمين' : 'Explore All'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teachers.slice(0, 2).map((tchr) => (
            <div
              key={tchr.userId}
              onClick={() => {
                if (onSelectTeacher) onSelectTeacher(tchr.userId);
                else onNavigateTab('explore');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-between cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={tchr.avatar}
                  alt={tchr.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? tchr.nameAr || tchr.name : tchr.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tchr.subjects.join(', ')} • {tchr.grades[0]}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{tchr.rating}</span>
                    <span className="text-slate-400 text-[10px] font-normal">
                      ({tchr.ratingCount} {t('ratingsCount')})
                    </span>
                  </div>
                </div>
              </div>
              <button className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                {t('reserveSeat')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showQRModal && (
        <QRDisplayModal
          session={nextSession}
          enrollment={nextEnrollment}
          student={user!}
          onClose={() => setShowQRModal(false)}
          onPayOnline={() => {
            setShowQRModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          session={nextSession}
          enrollment={nextEnrollment}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            // Re-open QR modal to immediately show the PAID state!
            setShowQRModal(true);
          }}
        />
      )}

      {/* Session Details Modal */}
      {selectedSessionForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('viewSession')}
              </h3>
              <button
                onClick={() => setSelectedSessionForDetail(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Done
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>Subject:</strong> {selectedSessionForDetail.subject} ({selectedSessionForDetail.grade})</p>
              <p><strong>Teacher:</strong> {selectedSessionForDetail.teacherName}</p>
              <p><strong>Center:</strong> {selectedSessionForDetail.centerName} • {selectedSessionForDetail.branchName}</p>
              <p><strong>Room:</strong> {selectedSessionForDetail.room}</p>
              <p><strong>Time:</strong> {selectedSessionForDetail.date} • {selectedSessionForDetail.startTime} - {selectedSessionForDetail.endTime}</p>
              <p><strong>Price:</strong> {selectedSessionForDetail.priceEgp} EGP</p>
            </div>
            <button
              onClick={() => {
                setSelectedSessionForDetail(null);
                setShowQRModal(true);
              }}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              {t('showAttendanceQR')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
