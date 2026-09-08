import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { financeService } from '../../services';
import {
  Building,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileCheck,
  DoorOpen
} from 'lucide-react';

export const CenterOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const sessions = storageService.getSessions();
  const enrollments = storageService.getEnrollments();
  const settlements = storageService.getSettlements();

  const [settlementList, setSettlementList] = useState(settlements);

  // Financial aggregates
  const totalGrossRevenue = 64500;
  const centerNetShare = 16125;
  const teacherPayouts = 48375;
  const pendingCashCollections = 1200;

  const handleApproveSettlement = (settlementId: string) => {
    storageService.updateSettlementStatus(settlementId, 'APPROVED');
    setSettlementList(storageService.getSettlements());
  };

  const handleMarkSettlementPaid = (settlementId: string) => {
    storageService.updateSettlementStatus(settlementId, 'PAID');
    setSettlementList(storageService.getSettlements());
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Center Owner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('centerManagement')} 🏢
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'لوحة إدارة سنتر كاي إديو (الدقي) — المالية والمستحقات وحجوزات القاعات'
              : 'KAYEDU Demo Center (Dokki) • Real-time Operations & Financial Settlement'}
          </p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start">
          {t('roleCenterOwner')}
        </span>
      </div>

      {/* Financial KPIs Grid (Section 40) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('totalRevenue')}
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {totalGrossRevenue.toLocaleString()} EGP
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14% this month
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('centerProfit')} (25%)
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {centerNetShare.toLocaleString()} EGP
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Net Profit</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('teacherSettlements')} (75%)
          </span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
            {teacherPayouts.toLocaleString()} EGP
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Payable to educators</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('unpaidBills')}
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {pendingCashCollections.toLocaleString()} EGP
          </p>
          <span className="text-[10px] text-amber-600 mt-1 block">Uncollected student dues</span>
        </div>
      </div>

      {/* Teacher Settlement & Payout Approvals (Section 41) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            {t('teacherSettlements')} & Approvals
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Cycle: Sep 1 – Sep 7, 2026
          </span>
        </div>

        <div className="space-y-3">
          {settlementList.map(st => (
            <div
              key={st.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {st.teacherName}
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      st.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : st.status === 'APPROVED'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  {st.totalSessions} Sessions • {st.totalStudentsAttended} Students attended
                </p>
                <div className="flex items-center gap-4 mt-2 font-mono text-[11px]">
                  <span>Gross: <strong>{st.totalGrossEgp.toLocaleString()} EGP</strong></span>
                  <span className="text-emerald-600">Teacher Share: <strong>{st.teacherShareEgp.toLocaleString()} EGP</strong></span>
                  <span className="text-purple-600">Center Share: <strong>{st.centerShareEgp.toLocaleString()} EGP</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {st.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => handleApproveSettlement(st.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    Approve Settlement
                  </button>
                )}
                {st.status === 'APPROVED' && (
                  <button
                    onClick={() => handleMarkSettlementPaid(st.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    Mark Paid (InstaPay/Bank)
                  </button>
                )}
                {st.status === 'PAID' && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Paid on {st.payoutDate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room & Hall Utilization */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-indigo-600" />
            Room Allocation & Capacity Utilization
          </h3>
          <span className="text-xs text-slate-400">8 Halls Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { room: 'Room 1 (Hall A)', cap: 80, current: 75, status: 'Occupied' },
            { room: 'Room 2 (Hall B)', cap: 60, current: 58, status: 'Occupied' },
            { room: 'Room 3 (Lab)', cap: 30, current: 0, status: 'Available' },
            { room: 'Room 4 (VIP)', cap: 25, current: 20, status: 'Occupied' },
          ].map(r => (
            <div key={r.room} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">{r.room}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{r.current} / {r.cap} Seats</p>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                r.status === 'Occupied' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
