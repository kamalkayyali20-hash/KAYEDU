import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { attendanceService, paymentService, sessionService } from '../../services';
import { storageService } from '../../services/storageService';
import { StudentSessionEnrollment, Session } from '../../types';
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  Building,
  DoorOpen,
  User,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface ReceptionScannerModalProps {
  onClose: () => void;
  onAttendanceRecorded?: () => void;
}

export const ReceptionScannerModal: React.FC<ReceptionScannerModalProps> = ({
  onClose,
  onAttendanceRecorded
}) => {
  const { user, primaryCenterId } = useAuth();
  const { t, language } = useLanguage();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified' | 'cash_confirm' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scannedEnrollment, setScannedEnrollment] = useState<StudentSessionEnrollment | null>(null);
  const [scannedSession, setScannedSession] = useState<Session | null>(null);
  const [confirmedTimestamp, setConfirmedTimestamp] = useState<string>('');

  // Handle trigger of scanning one of the demo students
  const handleSimulateScan = (studentKey: 'ahmed' | 'sara' | 'omar' | 'expired' | 'wrong_center') => {
    setScanState('scanning');

    setTimeout(() => {
      if (studentKey === 'expired') {
        setErrorMessage(t('qrErrorExpired'));
        setScanState('error');
        return;
      }

      if (studentKey === 'wrong_center') {
        setErrorMessage(t('qrErrorWrongCenter'));
        setScanState('error');
        return;
      }

      const sessions = storageService.getSessions();
      const phySession = sessions.find(s => s.id === 'sess_phy_today') || sessions[0];
      const enrollments = storageService.getEnrollments();

      let targetStudentId = 'user_student_1';
      if (studentKey === 'sara') targetStudentId = 'user_student_sara';
      if (studentKey === 'omar') targetStudentId = 'user_student_omar';

      const enrollment = enrollments.find(e => e.sessionId === phySession.id && e.studentId === targetStudentId);

      if (!enrollment) {
        setErrorMessage('Student enrollment record not found for this center.');
        setScanState('error');
        return;
      }

      setScannedSession(phySession);
      setScannedEnrollment(enrollment);
      setScanState('verified');
    }, 600);
  };

  // Confirm attendance for already paid student
  const handleConfirmAttendance = () => {
    if (!scannedEnrollment) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    attendanceService.recordAttendance(
      scannedEnrollment.id,
      'PRESENT',
      user?.name || 'Reception Staff'
    );

    setConfirmedTimestamp(timeStr);
    setScanState('confirmed');
    onAttendanceRecorded?.();
  };

  // Collect cash at reception for unpaid student (Journey 3)
  const handleCollectCash = () => {
    if (!scannedEnrollment || !scannedSession) return;
    setScanState('cash_confirm');
  };

  const handleConfirmCashReceipt = () => {
    if (!scannedEnrollment || !scannedSession) return;

    // 1. Record cash payment
    const updated = paymentService.recordCashPaymentAtCenter(
      scannedEnrollment.id,
      scannedSession.priceEgp,
      user?.name || 'Nouran Samir (Reception)'
    );

    // 2. Mark attendance immediately as Present
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    attendanceService.recordAttendance(
      scannedEnrollment.id,
      'PRESENT',
      user?.name || 'Reception Staff'
    );

    setScannedEnrollment(updated);
    setConfirmedTimestamp(timeStr);
    setScanState('confirmed');
    onAttendanceRecorded?.();
  };

  const resetScanner = () => {
    setScanState('idle');
    setScannedEnrollment(null);
    setScannedSession(null);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('receptionScannerTitle')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {primaryCenterId === 'center_kayedu' ? 'KAYEDU Demo Center (Dokki Branch)' : 'Reception Gate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* State 1: Viewfinder Scanning Simulation */}
          {(scanState === 'idle' || scanState === 'scanning') && (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center text-white shadow-inner">
                {/* Viewfinder brackets */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-400 rounded-br" />

                {/* Animated laser scanline */}
                {scanState === 'scanning' ? (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce top-1/3" />
                ) : (
                  <Camera className="w-10 h-10 text-slate-600 mb-2" />
                )}

                <p className="text-xs text-slate-300 font-medium z-10 px-4 text-center">
                  {scanState === 'scanning'
                    ? (language === 'ar' ? 'جاري التحقق وفك تشفير الرمز...' : 'Validating token & session enrollment...')
                    : (language === 'ar' ? 'وجّه كاميرا الهاتف نحو رمز QR المعروض في هاتف الطالب' : 'Align camera with student QR token')}
                </p>
              </div>

              {/* Fast Simulator Controls for testing journeys */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'محاكاة مسح رمز الطالب (اختر للتجربة)' : 'Simulate Scanning Student (Choose Journey):'}
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => handleSimulateScan('ahmed')}
                    className="w-full text-start p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                        ST
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          Ahmed Mohamed (ST-001245)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'ar' ? 'الحصة: فيزياء 11 • أ. أحمد حسن' : 'Physics Grade 11 • Room 4'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {language === 'ar' ? 'مسح' : 'Scan'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('omar')}
                    className="w-full text-start p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-xs flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                        $$
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          Omar Khaled (ST-001247) — Journey 3
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {language === 'ar' ? 'غير مسدد (تحصيل نقدي بالاستقبال 200 ج)' : 'UNPAID • Test Cash Collection'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                      {language === 'ar' ? 'تجربة التحصيل' : 'Test Unpaid'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSimulateScan('expired')}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {language === 'ar' ? 'اختبار رمز منتهي' : 'Test Expired Token'}
                    </button>
                    <button
                      onClick={() => handleSimulateScan('wrong_center')}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {language === 'ar' ? 'اختبار مركز غير مصرح' : 'Test Wrong Center'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* State 2: Student Verified Popup Screen */}
          {scanState === 'verified' && scannedEnrollment && scannedSession && (
            <div className="space-y-4 animate-in zoom-in-95 duration-150">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black tracking-wide text-emerald-800 dark:text-emerald-300">
                    {t('studentVerified')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                  TOKEN VALID
                </span>
              </div>

              {/* Student identity card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3.5">
                <img
                  src={scannedEnrollment.studentAvatar}
                  alt={scannedEnrollment.studentName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-sm"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {scannedEnrollment.studentName}
                  </h4>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {scannedEnrollment.studentCode}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {scannedSession.grade} • Thanaweya Amma
                  </p>
                </div>
              </div>

              {/* Session verification breakdown */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'ar' ? 'المدرس' : 'Teacher'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {scannedSession.teacherName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('subject')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {scannedSession.subject}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'ar' ? 'المركز / القاعة' : 'Center / Room'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {scannedSession.centerName} • {scannedSession.room}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('price')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {scannedSession.priceEgp} EGP
                  </span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex items-center justify-between">
                  <span className="text-slate-500">{t('paymentStatus')}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      scannedEnrollment.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    }`}
                  >
                    {scannedEnrollment.paymentStatus === 'PAID' ? 'PAID ONLINE' : 'UNPAID'}
                  </span>
                </div>
              </div>

              {/* Action Buttons based on Payment Status */}
              {scannedEnrollment.paymentStatus === 'PAID' ? (
                <div className="space-y-2">
                  <button
                    onClick={handleConfirmAttendance}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('confirmAttendance')}
                  </button>
                  <button
                    onClick={resetScanner}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء والمسح التالي' : 'Cancel / Scan Next'}
                  </button>
                </div>
              ) : (
                /* Unpaid student actions (Journey 3) */
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      {language === 'ar'
                        ? 'الطالب لم يسدد رسوم الحصة (200 ج). يمكنك تحصيل المبلغ نقداً الآن عند الاستقبال.'
                        : 'Student has not paid session fees. Please collect cash at reception.'}
                    </span>
                  </div>

                  <button
                    onClick={handleCollectCash}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Banknote className="w-4 h-4" />
                    {language === 'ar'
                      ? `تحصيل ${scannedSession.priceEgp} جنيه مصري نقداً وتأكيد الحضور`
                      : `Collect ${scannedSession.priceEgp} EGP Cash & Confirm Entry`}
                  </button>

                  <button
                    onClick={handleConfirmAttendance}
                    className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {language === 'ar' ? 'تجاوز استثنائي مصرح للحضور' : 'Authorized Attendance Override'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* State 3: Cash Receipt Confirmation Step */}
          {scanState === 'cash_confirm' && scannedEnrollment && scannedSession && (
            <div className="space-y-4 text-center py-3 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Banknote className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('confirmCashReceipt')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'ar'
                    ? `استلام ${scannedSession.priceEgp} ج من الطالب ${scannedEnrollment.studentName}`
                    : `Receive ${scannedSession.priceEgp} EGP cash from ${scannedEnrollment.studentName}`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-start space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Collected By:</span>
                  <span className="font-semibold">{user?.name || 'Nouran Samir'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Center Account:</span>
                  <span className="font-semibold">{scannedSession.centerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {scannedSession.priceEgp} EGP
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScanState('verified')}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmCashReceipt}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('confirm')}
                </button>
              </div>
            </div>
          )}

          {/* State 4: Attendance Confirmed Success */}
          {scanState === 'confirmed' && scannedEnrollment && (
            <div className="text-center py-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('attendanceConfirmedSuccess')}
                </h4>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs mt-2 border border-emerald-200 dark:border-emerald-800">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ar' ? 'حاضر — ' : 'Present — '}
                    {confirmedTimestamp || '17:57'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {language === 'ar'
                  ? 'تم تحديث جدول الحصة ولوحة المدرس فورياً، وإشعار ولي الأمر بحضور الطالب.'
                  : 'Session roster updated. Teacher and parent dashboards synchronized.'}
              </p>

              <button
                onClick={resetScanner}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {language === 'ar' ? 'مسح طالب آخر' : 'Scan Next Student'}
              </button>
            </div>
          )}

          {/* State 5: Error State */}
          {scanState === 'error' && (
            <div className="text-center py-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'فشل التحقق من الرمز' : 'Verification Failed'}
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                  {errorMessage || t('qrErrorExpired')}
                </p>
              </div>

              <button
                onClick={resetScanner}
                className="w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'ar' ? 'المحاولة مجدداً' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
