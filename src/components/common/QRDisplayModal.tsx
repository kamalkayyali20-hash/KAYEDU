import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Session, StudentSessionEnrollment, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { attendanceService } from '../../services';
import {
  X,
  RotateCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  DoorOpen
} from 'lucide-react';

interface QRDisplayModalProps {
  session: Session;
  enrollment: StudentSessionEnrollment;
  student: User;
  onClose: () => void;
  onPayOnline: () => void;
}

export const QRDisplayModal: React.FC<QRDisplayModalProps> = ({
  session,
  enrollment,
  student,
  onClose,
  onPayOnline
}) => {
  const { t, language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [tokenPayload, setTokenPayload] = useState(() =>
    attendanceService.generateQRToken(student, session, enrollment)
  );

  const generateCode = async () => {
    const payload = attendanceService.generateQRToken(student, session, enrollment);
    setTokenPayload(payload);
    setTimeLeft(120);
    setIsExpired(false);

    try {
      const url = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  useEffect(() => {
    generateCode();
  }, [enrollment.paymentStatus, enrollment.attendanceStatus]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isPaid = enrollment.paymentStatus === 'PAID';
  const isPresent = enrollment.attendanceStatus === 'PRESENT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('showAttendanceQR')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {session.subject} • {session.grade}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center text-center">
          {/* Status Pills */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {isPaid ? t('paid') : t('unpaid')}
            </span>

            {isPresent && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800">
                {t('present')} ({enrollment.attendanceTime || 'Confirmed'})
              </span>
            )}
          </div>

          {/* QR Container */}
          <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-inner my-1">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Attendance QR Code"
                className={`w-52 h-52 object-contain transition-opacity ${
                  isExpired ? 'opacity-20 blur-[1px]' : 'opacity-100'
                }`}
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                {t('loading')}
              </div>
            )}

            {isExpired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
                  {t('qrExpiredNotice')}
                </p>
                <button
                  onClick={generateCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {t('refresh')}
                </button>
              </div>
            )}
          </div>

          {/* Countdown timer */}
          {!isExpired && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {t('qrValidCountdown')}:{' '}
                <strong className="text-slate-900 dark:text-white font-mono text-sm">
                  {formatTime(timeLeft)}
                </strong>
              </span>
              <button
                onClick={generateCode}
                className="p-1 hover:text-indigo-600 transition-colors"
                title="Regenerate Token"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Session Location & Room Meta */}
          <div className="w-full mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-start text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Building className="w-3.5 h-3.5" /> {language === 'ar' ? 'المركز' : 'Center'}
              </span>
              <span className="font-semibold">{session.centerName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-500">
                <DoorOpen className="w-3.5 h-3.5" /> {t('room')}
              </span>
              <span className="font-semibold">{session.room}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">{t('price')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{session.priceEgp} EGP</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {t('qrSecureNotice')}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2">
          {!isPaid && (
            <button
              onClick={() => {
                onClose();
                onPayOnline();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {t('payOnline')} ({session.priceEgp} EGP)
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
