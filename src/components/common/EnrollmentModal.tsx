import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Session, StudentSessionEnrollment } from '../../types';
import {
  X,
  CheckCircle2,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CreditCard,
  Wallet,
  Coins,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface EnrollmentModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrolled?: (enrollment: StudentSessionEnrollment) => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  session,
  isOpen,
  onClose,
  onEnrolled
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'center_cash' | 'online_card' | 'digital_wallet'>('center_cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !session) return null;

  const remainingSeats = Math.max(0, session.capacity - session.enrolledCount);

  const handleEnroll = () => {
    if (!user) return;
    setIsProcessing(true);

    setTimeout(() => {
      const enrollment = storageService.enrollStudent(user, session.id, paymentMethod);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (enrollment && onEnrolled) {
          onEnrolled(enrollment);
        }
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/30 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'حجز مقعد في الحصة' : 'Confirm Class Enrollment'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {session.centerName} • {session.grade}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-100">
                {language === 'ar' ? 'تم تأكيد حجزك بنجاح!' : 'Enrollment Confirmed!'}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {language === 'ar'
                  ? 'تمت إضافة الحصة إلى جدولك الدراسي. يمكنك إبراز تذكرة الحضور (QR) في السنتر.'
                  : 'Class added to your schedule. You can present your QR attendance ticket at the center.'}
              </p>
            </div>
          ) : (
            <>
              {/* Session Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={session.teacherAvatar}
                    alt={session.teacherName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {session.subject}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {session.grade}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                      {language === 'ar' ? session.teacherNameAr || session.teacherName : session.teacherName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {session.groupName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{session.centerName} • {session.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{remainingSeats} seats left</span>
                  </div>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {language === 'ar' ? 'سعر الحصة المقررة:' : 'Session Fee:'}
                </span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {session.priceEgp} EGP
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'اختر طريقة الدفع:' : 'Select Payment Option:'}
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod('center_cash')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'center_cash'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          {language === 'ar' ? 'الدفع كاش في السنتر' : 'Pay Cash at Center'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'ar' ? 'احجز الآن وادفع في الاستقبال قبل بدء الحصة' : 'Reserve now and pay upon arrival at reception'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'center_cash' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'center_cash' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('online_card')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'online_card'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          {language === 'ar' ? 'بطاقة بنكية (فيزا / ماستركارد)' : 'Debit / Credit Card'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'ar' ? 'دفع إلكتروني فوري وتأكيد التذكرة' : 'Instant payment & confirmed QR check-in'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'online_card' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'online_card' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('digital_wallet')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'digital_wallet'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          {language === 'ar' ? 'محافظ إلكترونية / إنستاباي' : 'Vodafone Cash / InstaPay'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'ar' ? 'فودافون كاش، إنستاباي، اتصالات كاش' : 'Instant mobile wallet transfer'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'digital_wallet' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'digital_wallet' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleEnroll}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? (language === 'ar' ? 'جاري التأكيد...' : 'Processing...')
                      : (language === 'ar' ? 'تأكيد الحجز والانضمام' : 'Confirm & Join Class')}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
