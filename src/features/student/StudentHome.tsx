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
  ArrowUpRight,
  Building,
  MapPin,
  Phone,
  UserCheck,
  ShieldCheck,
  Award
} from 'lucide-react';
import { QRDisplayModal } from '../../components/common/QRDisplayModal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { EnrollmentModal } from '../../components/common/EnrollmentModal';

interface StudentHomeProps {
  onNavigateTab: (tab: string) => void;
  onSelectTeacher?: (teacherId: string) => void;
  onOpenAuthModal?: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onNavigateTab,
  onSelectTeacher,
  onOpenAuthModal
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [refreshCount, setRefreshCount] = useState(0);
  const [activeCenterTab, setActiveCenterTab] = useState<'both' | 'center_60' | 'center_modern'>('both');

  const studentGrade = user?.grade || 'Grade 10';

  // Load all sessions and filter strictly by student's registered grade
  const allSessions = storageService.getSessions();
  const gradeSessions = allSessions.filter(s => !studentGrade || s.grade === studentGrade);
  const sessions = gradeSessions.length > 0 ? gradeSessions : allSessions;

  const enrollments = storageService.getEnrollments();

  // Load all teachers and filter strictly by student's registered grade
  const allTeachers = storageService.getTeachers();
  const gradeTeachers = allTeachers.filter(t => !t.grades || t.grades.includes(studentGrade));
  const teachers = gradeTeachers.length > 0 ? gradeTeachers : allTeachers;

  // Filter homework and exams strictly by student's registered grade
  const allHomework = storageService.getHomework();
  const homeworkList = allHomework.filter(h => !studentGrade || h.grade === studentGrade);

  const allExams = storageService.getExams();
  const exams = allExams.filter(e => !studentGrade || e.grade === studentGrade);

  // Next session for student Ahmed or first enrolled session
  const studentEnrolledSessionIds = enrollments
    .filter(e => e.studentId === (user?.id || 'user_student_1'))
    .map(e => e.sessionId);

  const nextSession = sessions.find(s => studentEnrolledSessionIds.includes(s.id)) || sessions[0];
  const nextEnrollment = enrollments.find(e => e.sessionId === nextSession?.id && e.studentId === (user?.id || 'user_student_1')) || {
    id: 'enr_temp',
    sessionId: nextSession?.id || '',
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
  const [enrollingSession, setEnrollingSession] = useState<Session | null>(null);

  const isPaid = nextEnrollment.paymentStatus === 'PAID';

  // Filtered data by center
  const center60Sessions = sessions.filter(s => s.centerId === 'center_60');
  const centerModernSessions = sessions.filter(s => s.centerId === 'center_modern');

  const center60Homework = homeworkList.filter(h => h.centerId === 'center_60');
  const centerModernHomework = homeworkList.filter(h => h.centerId === 'center_modern');

  const center60Exams = exams.filter(e => e.centerId === 'center_60');
  const centerModernExams = exams.filter(e => e.centerId === 'center_modern');

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Personalized Greeting with clickable Student Avatar to open Login / Register Form */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="relative group focus:outline-none"
            title={language === 'ar' ? 'اضغط لتسجيل الدخول أو إنشاء حساب' : 'Click to open Login & Register Form'}
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Student'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40 group-hover:scale-105 transition-all shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
              <UserCheck className="w-3 h-3" />
            </div>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {t('goodEvening')}, {user?.name.split(' ')[0] || 'Ahmed'} 👋
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {user?.grade || 'Grade 11'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'مرحباً بك في سنتر 60 وسنتر مودرن التعليمي'
                : 'Enrolled across Center 60 & Center Modern'}
            </p>
          </div>
        </div>

        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors shrink-0"
          >
            {language === 'ar' ? 'تسجيل / حساب' : 'Sign In / Register'}
          </button>
        )}
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
              {/* Teacher Rating: stars only like 4.7, hiding raw rating count */}
              <span className="flex items-center text-amber-400 text-xs font-bold gap-0.5">
                <Star className="w-3 h-3 fill-amber-400" /> 4.7
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium">
              {nextSession.subject} • {nextSession.grade}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {nextSession.centerName} • {nextSession.room}
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

        {/* Journey 1 Actions */}
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

      {/* Grade Customization Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
          <p className="text-slate-700 dark:text-slate-200 truncate">
            {language === 'ar' ? (
              <>
                يتم الآن تصفية الحصص والمعلمين وفقاً لصفك الدراسي: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{studentGrade}</strong>
              </>
            ) : (
              <>
                Displaying classes and teachers tailored strictly for: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{studentGrade}</strong>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('profile')}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          {language === 'ar' ? 'تغيير الصف' : 'Change Grade'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2 CENTERS FEATURE SECTION: "Center 60" & "Center Modern" with sessions, homeworks & exams */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>{language === 'ar' ? 'المراكز التعليمية المعتمدة' : 'Official Educational Centers'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'استعرض الحصص، الواجبات المرفقة، والاختبارات في سنتر 60 وسنتر مودرن'
                : 'Explore live sessions, attached homework, and exams at Center 60 & Center Modern'}
            </p>
          </div>

          {/* Center Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl text-xs font-bold self-start">
            <button
              onClick={() => setActiveCenterTab('both')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCenterTab === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'كلا المركزين' : 'Both Centers'}
            </button>
            <button
              onClick={() => setActiveCenterTab('center_60')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCenterTab === 'center_60'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Center 60</span>
              <span className="text-[10px] opacity-80">(سنتر 60)</span>
            </button>
            <button
              onClick={() => setActiveCenterTab('center_modern')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCenterTab === 'center_modern'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Center Modern</span>
              <span className="text-[10px] opacity-80">(مودرن)</span>
            </button>
          </div>
        </div>

        {/* ======================= CENTER 60 CARD ======================= */}
        {(activeCenterTab === 'both' || activeCenterTab === 'center_60') && (
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-950/60 shadow-sm space-y-4">
            {/* Center Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-indigo-600/30">
                  60
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Center 60 — سنتر 60 التعليمي
                    </h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200/50">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>مدينة نصر والتجمع الخامس، القاهرة • Nasr City & 5th Settlement</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'سنتر معتمد' : 'Verified Center'}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  {center60Sessions.length} {language === 'ar' ? 'حصص متاحة' : 'Sessions'}
                </span>
              </div>
            </div>

            {/* Sub-section: Sessions at Center 60 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'ar' ? 'حصص ومواعيد سنتر 60' : 'Center 60 Sessions'}</span>
                </h5>
                <span className="text-[10px] text-slate-400">Hall A & Hall B</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {center60Sessions.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center col-span-2">
                    {language === 'ar' ? 'لا توجد حصص مجدولة لهذا الصف حالياً في سنتر 60' : 'No classes scheduled for this grade at Center 60 yet.'}
                  </p>
                ) : (
                  center60Sessions.slice(0, 4).map((sess) => {
                    const isEnrolled = enrollments.some(
                      e => e.sessionId === sess.id && (e.studentId === (user?.id || 'user_student_1'))
                    );
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedSessionForDetail(sess)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={sess.teacherAvatar}
                            alt={sess.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {sess.subject} — {language === 'ar' ? sess.teacherNameAr || sess.teacherName : sess.teacherName}
                            </h6>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {sess.date} • {sess.startTime} • {sess.room}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-end">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                              {sess.priceEgp} EGP
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {sess.grade}
                            </span>
                          </div>
                          {isEnrolled ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              {language === 'ar' ? 'مشترك ✓' : 'Joined ✓'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnrollingSession(sess);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm transition-all"
                            >
                              {language === 'ar' ? 'حجز' : 'Enroll'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sub-section: Center 60 Attached Homeworks & Exams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Attached Homework at Center 60 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'واجبات سنتر 60 المرفقة' : 'Center 60 Attached Homework'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    {center60Homework.length} Tasks
                  </span>
                </div>

                <div className="space-y-2">
                  {center60Homework.slice(0, 2).map((hw) => (
                    <div key={hw.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{hw.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {hw.subject} • {language === 'ar' ? 'موعد التسليم:' : 'Due:'} {hw.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Exams at Center 60 */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'اختبارات سنتر 60 المرفقة' : 'Center 60 Attached Exams'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                    {center60Exams.length} Exams
                  </span>
                </div>

                <div className="space-y-2">
                  {center60Exams.slice(0, 2).map((ex) => (
                    <div key={ex.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ex.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ex.subject} • {ex.durationMinutes} mins • {ex.totalPoints} pts
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= CENTER MODERN CARD ======================= */}
        {(activeCenterTab === 'both' || activeCenterTab === 'center_modern') && (
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Center Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-emerald-600/30">
                  MOD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Center Modern — سنتر مودرن التعليمي
                    </h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200/50">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.8
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المهندسين والدقي، الجيزة • Mohandessin & Dokki, Giza</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'سنتر معتمد' : 'Verified Center'}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  {centerModernSessions.length} {language === 'ar' ? 'حصص متاحة' : 'Sessions'}
                </span>
              </div>
            </div>

            {/* Sub-section: Sessions at Center Modern */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'حصص ومواعيد سنتر مودرن' : 'Center Modern Sessions'}</span>
                </h5>
                <span className="text-[10px] text-slate-400">Hall 101 & Hall 102</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {centerModernSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center col-span-2">
                    {language === 'ar' ? 'لا توجد حصص مجدولة لهذا الصف حالياً في سنتر مودرن' : 'No classes scheduled for this grade at Center Modern yet.'}
                  </p>
                ) : (
                  centerModernSessions.slice(0, 4).map((sess) => {
                    const isEnrolled = enrollments.some(
                      e => e.sessionId === sess.id && (e.studentId === (user?.id || 'user_student_1'))
                    );
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedSessionForDetail(sess)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={sess.teacherAvatar}
                            alt={sess.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {sess.subject} — {language === 'ar' ? sess.teacherNameAr || sess.teacherName : sess.teacherName}
                            </h6>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {sess.date} • {sess.startTime} • {sess.room}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-end">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                              {sess.priceEgp} EGP
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {sess.grade}
                            </span>
                          </div>
                          {isEnrolled ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              {language === 'ar' ? 'مشترك ✓' : 'Joined ✓'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnrollingSession(sess);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-all"
                            >
                              {language === 'ar' ? 'حجز' : 'Enroll'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sub-section: Center Modern Attached Homeworks & Exams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Attached Homework at Center Modern */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'واجبات سنتر مودرن المرفقة' : 'Center Modern Attached Homework'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                    {centerModernHomework.length} Tasks
                  </span>
                </div>

                <div className="space-y-2">
                  {centerModernHomework.slice(0, 2).map((hw) => (
                    <div key={hw.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{hw.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {hw.subject} • {language === 'ar' ? 'موعد التسليم:' : 'Due:'} {hw.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Exams at Center Modern */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-400 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'اختبارات سنتر مودرن المرفقة' : 'Center Modern Attached Exams'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                    {centerModernExams.length} Exams
                  </span>
                </div>

                <div className="space-y-2">
                  {centerModernExams.slice(0, 2).map((ex) => (
                    <div key={ex.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ex.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ex.subject} • {ex.durationMinutes} mins • {ex.totalPoints} pts
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Teachers with stars only (no number of ratings) */}
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
          {teachers.slice(0, 4).map((tchr) => (
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
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? tchr.nameAr || tchr.name : tchr.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tchr.subjects.join(', ')} • {tchr.grades.join(', ')}
                  </p>
                  {/* Star rating only without raw rating count as requested */}
                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{tchr.rating.toFixed(1)}</span>
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
            setShowQRModal(true);
          }}
        />
      )}

      {/* Session Details Modal */}
      {selectedSessionForDetail && (() => {
        const isSelectedEnrolled = enrollments.some(
          e => e.sessionId === selectedSessionForDetail.id && (e.studentId === (user?.id || 'user_student_1'))
        );
        return (
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
                <p><strong>Capacity:</strong> {selectedSessionForDetail.enrolledCount} / {selectedSessionForDetail.capacity} enrolled</p>
              </div>

              {isSelectedEnrolled ? (
                <button
                  onClick={() => {
                    setSelectedSessionForDetail(null);
                    setShowQRModal(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t('showAttendanceQR')}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const sess = selectedSessionForDetail;
                    setSelectedSessionForDetail(null);
                    setEnrollingSession(sess);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حجز مقعد في هذه الحصة الآن' : 'Enroll in this Class Now'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Enrollment Modal */}
      {enrollingSession && (
        <EnrollmentModal
          session={enrollingSession}
          isOpen={!!enrollingSession}
          onClose={() => setEnrollingSession(null)}
          onEnrolled={() => {
            setRefreshCount(c => c + 1);
          }}
        />
      )}
    </div>
  );
};
