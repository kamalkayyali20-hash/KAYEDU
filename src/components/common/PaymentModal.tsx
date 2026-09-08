import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Session, StudentSessionEnrollment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { paymentService } from '../../services';
import {
  X,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Building,
  Loader2,
  Receipt,
  Sparkles
} from 'lucide-react';

interface PaymentModalProps {
  session: Session;
  enrollment: StudentSessionEnrollment;
  onClose: () => void;
  onPaymentSuccess: (updatedEnrollment: StudentSessionEnrollment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  session,
  enrollment,
  onClose,
  onPaymentSuccess
}) => {
  const { t, language } = useLanguage();
  const [method, setMethod] = useState<'online_card' | 'digital_wallet'>('online_card');
  const [cardNumber, setCardNumber] = useState('4125 •••• •••• 8842');
  const [walletPhone, setWalletPhone] = useState('+20 101 234 5678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{ receipt: string; paidAt: string } | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const updated = await paymentService.processOnlinePayment(
        enrollment.id,
        session.priceEgp,
        method
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessData({
        receipt: updated.receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
        paidAt: updated.paidAt || 'Just now'
      });
      onPaymentSuccess(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('payOnline')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {session.centerName}
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
        <div className="p-5 overflow-y-auto space-y-4">
          {successData ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Completed!'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'تم تسجيل السداد وتحديث حالة الحصة فورياً لتسجيل الحضور'
                    : 'Transaction confirmed. Your attendance QR is now marked as PAID.'}
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-start space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" /> Receipt #
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {successData.receipt}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Session</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {session.subject} — {session.teacherName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {session.priceEgp} EGP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {successData.paidAt}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {language === 'ar' ? 'عرض رمز الحضور الآن' : 'Show Attendance QR'}
              </button>
            </div>
          ) : (
            <>
              {/* Order breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('subject')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {session.subject} ({session.grade})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'ar' ? 'المدرس' : 'Teacher'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {session.teacherName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'ar' ? 'المركز' : 'Center'}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {session.centerName} • {session.branchName}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'المبلغ المستحق' : 'Total Due'}
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                    {session.priceEgp} EGP
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('online_card')}
                    className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all ${
                      method === 'online_card'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold">Credit / Debit Card</span>
                    <span className="text-[10px] text-slate-500">Visa, Mastercard, Meeza</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('digital_wallet')}
                    className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all ${
                      method === 'digital_wallet'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold">Digital Wallet / InstaPay</span>
                    <span className="text-[10px] text-slate-500">Vodafone Cash, Orange, IPN</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs */}
              {method === 'online_card' ? (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        defaultValue="08/28"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="342"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Registered Mobile Wallet Number
                  </label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={e => setWalletPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    A notification prompt will be simulated to confirm the 200 EGP transfer.
                  </p>
                </div>
              )}

              {/* Security guarantee */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'معاملة مالية آمنة ومحمية بتشفير 256-bit عبر بوابة كاي-سوفت'
                    : 'Encrypted 256-bit secure transaction via KAY-SOFT Financial Gateway'}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'ar' ? 'جاري معالجة الدفع...' : 'Processing Payment...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {language === 'ar'
                        ? `سداد ${session.priceEgp} جنيه مصري الآن`
                        : `Pay ${session.priceEgp} EGP Now`}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
