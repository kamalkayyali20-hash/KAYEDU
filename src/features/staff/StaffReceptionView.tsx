import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { attendanceService } from '../../services';
import {
  QrCode,
  Scan,
  Camera,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  DollarSign,
  Receipt,
  Wifi,
  WifiOff,
  UserCheck,
  Building,
  RefreshCw,
  Clock,
  Printer
} from 'lucide-react';
import { ReceptionScannerModal } from '../../components/common/ReceptionScannerModal';

export const StaffReceptionView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const sessions = storageService.getSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess_phy_today');
  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanFeedback, setScanFeedback] = useState<any>(null);

  // Offline mode toggle simulation (Section 48)
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Today's scan history
  const [recentScans, setRecentScans] = useState([
    {
      id: 'sc_1',
      studentName: 'Sara Ali',
      studentCode: 'ST-002190',
      time: '5:54 PM',
      paymentStatus: 'PAID',
      action: 'Access Granted (Pre-paid)',
      collected: 0
    },
    {
      id: 'sc_2',
      studentName: 'Omar Khaled',
      studentCode: 'ST-003411',
      time: '5:56 PM',
      paymentStatus: 'PAID_CASH',
      action: 'Access Granted (Collected 200 EGP)',
      collected: 200
    }
  ]);

  const handleManualScan = (codeToTest?: string) => {
    const code = codeToTest || manualCode.trim();
    if (!code) return;

    if (isOffline) {
      setOfflineQueueCount(prev => prev + 1);
      setScanFeedback({
        success: true,
        offline: true,
        message: 'Scan stored locally in offline queue. Will synchronize when online.'
      });
      return;
    }

    try {
      const result = attendanceService.verifyAndCheckInQR(code, selectedSession.id, user!);
      setScanFeedback(result);

      if (result.success) {
        setRecentScans(prev => [
          {
            id: `sc_${Date.now()}`,
            studentName: result.enrollment.studentName,
            studentCode: result.enrollment.studentCode,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            paymentStatus: result.paymentStatus,
            action: result.requiresPayment ? 'Payment Needed' : 'Access Granted',
            collected: result.requiresPayment ? 0 : 200
          },
          ...prev
        ]);
      }
    } catch (err: any) {
      setScanFeedback({ success: false, message: err.message });
    }
  };

  const handleCollectCash = () => {
    if (!scanFeedback?.enrollment) return;
    const payment = attendanceService.collectCashAtReception(
      scanFeedback.enrollment.id,
      selectedSession.id,
      user!
    );
    setScanFeedback({
      ...scanFeedback,
      requiresPayment: false,
      paymentStatus: 'PAID',
      message: 'Cash collected successfully. Receipt #RCP-2026-089 issued.'
    });

    setRecentScans(prev => [
      {
        id: `sc_${Date.now()}`,
        studentName: scanFeedback.enrollment.studentName,
        studentCode: scanFeedback.enrollment.studentCode,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentStatus: 'PAID_CASH',
        action: 'Collected 200 EGP (Cash Receipt)',
        collected: 200
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('receptionDesk')} 🏢
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'بوابة الدخول السريع وفحص الباركود وتحصيل الرسوم النقدية'
              : 'KAYEDU Demo Center (Dokki) • Gate 1 Reception Terminal'}
          </p>
        </div>

        {/* Offline Toggle Simulator (Section 48) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isOffline
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline Mode' : 'Online Connected'}</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Banner if enabled */}
      {isOffline && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Offline Mode Active:</strong> Scans stored in local storage cache. ({offlineQueueCount} queued for auto-sync)
            </span>
          </div>
          <button
            onClick={() => {
              setIsOffline(false);
              setOfflineQueueCount(0);
              alert('Reconnected! All queued offline scans synchronized with cloud database.');
            }}
            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Active Session Selection Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Gate Session:
          </span>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            Room {selectedSession.room} • {selectedSession.startTime}
          </span>
        </div>

        <select
          value={selectedSessionId}
          onChange={e => setSelectedSessionId(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
        >
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.subject} ({s.groupName}) — {s.teacherName} ({s.startTime} - {s.endTime})
            </option>
          ))}
        </select>
      </div>

      {/* Primary Scanner Trigger Hero (Journey 2) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Scan className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight">
            High-Speed Attendance Scanner
          </h3>
          <p className="text-xs text-indigo-200 max-w-sm mx-auto mt-1">
            Scan student dynamic QR codes with webcam/camera or test quick scenarios below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setShowScannerModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Open Live Camera Scanner</span>
          </button>
        </div>

        {/* Quick Simulation Scenarios (Section 13) */}
        <div className="pt-4 border-t border-indigo-800/50">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
            One-Click Scan Scenarios:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleManualScan('KAYEDU-SESS-sess_phy_today-ST-user_student_1')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Scan Ahmed (Physics G11)
            </button>
            <button
              onClick={() => handleManualScan('KAYEDU-SESS-sess_chem_nour-ST-user_student_nour')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Scan Nour (Chemistry)
            </button>
            <button
              onClick={() => handleManualScan('INVALID-TOKEN-999')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold"
            >
              Scan Invalid Token
            </button>
          </div>
        </div>
      </div>

      {/* Manual Code Input */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={manualCode}
          onChange={e => setManualCode(e.target.value)}
          placeholder="Manual Student Code (e.g. ST-001245 or paste token)"
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          onClick={() => handleManualScan()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
        >
          Verify
        </button>
      </div>

      {/* Scan Result Feedback Banner (Journey 2: Scenario A vs Scenario B) */}
      {scanFeedback && (
        <div
          className={`p-5 rounded-3xl border shadow-lg animate-in zoom-in-95 ${
            !scanFeedback.success
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              : scanFeedback.requiresPayment
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {scanFeedback.success ? (
                scanFeedback.requiresPayment ? (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    $
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}

              <div>
                <h4 className="text-base font-black">
                  {scanFeedback.success
                    ? scanFeedback.requiresPayment
                      ? 'Access Granted — Collect Cash'
                      : 'Access Granted — Already Paid'
                    : 'Access Denied / Invalid QR'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">{scanFeedback.message}</p>
              </div>
            </div>
          </div>

          {/* Cash Collection Action Button */}
          {scanFeedback.requiresPayment && (
            <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900 flex items-center justify-between">
              <span className="text-xs font-bold">
                Due: <strong>200 EGP</strong>
              </span>
              <button
                onClick={handleCollectCash}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>Confirm Cash (200 EGP) & Issue Receipt</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Today's Reception Scans Stream */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            Live Reception Stream
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {recentScans.length} Check-ins today
          </span>
        </div>

        <div className="space-y-2">
          {recentScans.map(sc => (
            <div
              key={sc.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sc.studentName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sc.studentCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{sc.action}</p>
              </div>

              <div className="text-end">
                <span className="font-mono text-slate-400 text-[10px] block">
                  {sc.time}
                </span>
                {sc.collected > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600">
                    +{sc.collected} EGP Cash
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Scanner */}
      {showScannerModal && (
        <ReceptionScannerModal
          session={selectedSession}
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={(feedback) => {
            setScanFeedback(feedback);
          }}
        />
      )}
    </div>
  );
};
