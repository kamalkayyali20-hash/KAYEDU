import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import {
  ShieldAlert,
  Building,
  Users,
  Award,
  DollarSign,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  Lock,
  Globe
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const teachers = storageService.getTeachers();
  const [teacherList, setTeacherList] = useState(teachers);

  const handleToggleVerify = (userId: string) => {
    const updated = teacherList.map(t => {
      if (t.userId === userId) {
        return { ...t, verified: !t.verified };
      }
      return t;
    });
    setTeacherList(updated);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Super Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('systemAdministration')} ⚡
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'إدارة الشبكة التعليمية الموحدة لجميع المراكز والمدرسين المعتمدين'
              : 'KAYEDU Nationwide Network Infrastructure • Super Administrator Panel'}
          </p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 self-start">
          {t('roleSuperAdmin')}
        </span>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Connected Centers
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            42
          </p>
          <span className="text-[10px] text-emerald-600 mt-1 block">Cairo & Giza Governorates</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Students
          </span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
            18,420
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Thanaweya & Prep</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Educators
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            485
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Top rated subject specialists</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly GMV (EGP)
          </span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
            3.4M
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Platform tuition volume</span>
        </div>
      </div>

      {/* Teacher Verification Approvals Table (Section 17 & 18) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Educator Verification & Accreditation
          </h3>
          <span className="text-xs text-slate-400">
            {teacherList.filter(t => t.verified).length} Verified
          </span>
        </div>

        <div className="space-y-2.5">
          {teacherList.map(tchr => (
            <div
              key={tchr.userId}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={tchr.avatar}
                  alt={tchr.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {tchr.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {tchr.subjects.join(', ')} • {tchr.experienceYears} Years Experience • Rating: {tchr.rating}★
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleVerify(tchr.userId)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 ${
                  tchr.verified
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {tchr.verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span>{tchr.verified ? 'Verified Badge Active' : 'Grant Verified Badge'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Audit Feed */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-rose-500" />
          Real-time Security & Integrity Logs
        </h3>

        <div className="space-y-2 font-mono text-[11px]">
          {[
            { log: '[QR_SECURE] Dynamic payload issued for Ahmed Mohamed (Physics G11) - Nonce verified', time: '18:02:11' },
            { log: '[PAY_INSTAPAY] Instant bank webhook confirmation 200.00 EGP recorded', time: '18:00:45' },
            { log: '[AUTH_RBAC] Center Staff session authorized for terminal Dokki-Gate-1', time: '17:55:20' }
          ].map((l, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-between">
              <span className="truncate">{l.log}</span>
              <span className="text-slate-500 shrink-0 ms-2">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
