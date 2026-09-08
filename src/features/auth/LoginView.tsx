import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role } from '../../types';
import {
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  Users,
  ShieldAlert,
  Loader2,
  KeyRound
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginAsDemo, registerUser } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  const [emailOrPhone, setEmailOrPhone] = useState('student@kayedu.demo');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals for Register & Forgot Password workflows
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    grade: 'Grade 11',
    system: 'Thanaweya Amma',
    subject: 'Physics',
    grades: ['Grade 10', 'Grade 11', 'Grade 12'],
    centerId: 'center_60',
    otp: ''
  });

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailOrPhone.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال البريد أو رقم الهاتف' : 'Please enter email or phone');
      return;
    }
    if (!password) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await login(emailOrPhone, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: Role) => {
    setIsLoading(true);
    try {
      await loginAsDemo(demoRole);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar with Language Switcher */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
            K
          </div>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
            KAYEDU
          </span>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 my-auto animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black flex items-center justify-center text-xl mx-auto shadow-lg shadow-indigo-500/20 mb-3">
            K
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('welcomeBack')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('signInSubtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('emailOrPhone')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 inset-s-3 pointer-events-none" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                placeholder="e.g. student@kayedu.demo or 01012345678"
                className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('password')}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 inset-s-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 inset-e-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-600 dark:text-slate-400">{t('rememberMe')}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('signingIn')}</span>
              </>
            ) : (
              <span>{t('login')}</span>
            )}
          </button>
        </form>

        {/* Demo Fast Access Grid */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {t('demoAccounts')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">pass: 123456</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoClick('student')}
              className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/70 text-xs font-bold text-start transition-all"
            >
              🎓 {t('roleStudent')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">student@kayedu</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('teacher')}
              className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 text-xs font-bold text-start transition-all"
            >
              👨‍🏫 {t('roleTeacher')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">teacher@kayedu</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('center_staff')}
              className="p-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 text-xs font-bold text-start transition-all"
            >
              📷 {t('roleCenterStaff')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">reception@kayedu</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('center_owner')}
              className="p-2 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100/70 text-xs font-bold text-start transition-all"
            >
              🏢 {t('roleCenterOwner')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">owner@kayedu</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('parent')}
              className="p-2 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 hover:bg-sky-100/70 text-xs font-bold text-start transition-all"
            >
              👨‍👩‍👧 {t('roleParent')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">parent@kayedu</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('super_admin')}
              className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 text-xs font-bold text-start transition-all"
            >
              ⚡ {t('roleSuperAdmin')}
              <span className="block text-[9px] font-normal text-slate-500 truncate">admin@kayedu</span>
            </button>
          </div>
        </div>

        {/* Create account trigger */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
          >
            {language === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
              {t('createAccount')}
            </span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-md w-full mx-auto text-center py-2 text-[11px] text-slate-400">
        <p className="font-semibold">{t('companyName')}</p>
        <p className="text-[10px] opacity-80">{t('companyTagline')}</p>
      </div>

      {/* Registration Modal (Section 8 workflow) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('createAccount')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Step {registerStep} of 4: {registerStep === 1 ? 'Account Type' : registerStep === 2 ? 'Personal Info' : registerStep === 3 ? 'Password & Security' : 'OTP Verification'}
            </p>

            {registerStep === 1 && (
              <div className="space-y-2">
                {(['student', 'teacher', 'parent'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRegisterRole(r);
                      setRegisterStep(2);
                    }}
                    className={`w-full p-3 rounded-xl border text-start flex items-center justify-between text-xs font-bold ${
                      registerRole === r ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{r.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            {registerStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    placeholder="First Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="Phone (+20 100 ...)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                />

                {/* STUDENT: "in the regester to write which grade i am with" */}
                {registerRole === 'student' && (
                  <div className="space-y-2 p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                    <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
                      {language === 'ar' ? 'حدد الصف الدراسي (إلزامي):' : 'Select Which Grade You Are In:'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Grade 10', 'Grade 11', 'Grade 12'].map(grd => (
                        <button
                          key={grd}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, grade: grd })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                            registerForm.grade === grd
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {grd}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Center Affiliation:</label>
                      <select
                        value={registerForm.centerId}
                        onChange={e => setRegisterForm({ ...registerForm, centerId: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option value="center_60">Center 60 (سنتر 60 - مدينة نصر)</option>
                        <option value="center_modern">Center Modern (سنتر مودرن - المهندسين)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TEACHER: "for teacher to be which subject and which grades bec as a teacher i can teach more than 1 grade" */}
                {registerRole === 'teacher' && (
                  <div className="space-y-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                      {language === 'ar' ? 'المادة التي تدرسها:' : 'Teaching Subject:'}
                    </label>
                    <select
                      value={registerForm.subject}
                      onChange={e => setRegisterForm({ ...registerForm, subject: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="Physics">Physics (فيزياء)</option>
                      <option value="Chemistry">Chemistry (كيمياء)</option>
                      <option value="Mathematics">Mathematics (رياضيات)</option>
                      <option value="Biology">Biology (أحياء)</option>
                      <option value="English Language">English (لغة إنجليزية)</option>
                      <option value="Arabic Language">Arabic (لغة عربية)</option>
                    </select>

                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 pt-1">
                      {language === 'ar' ? 'الصفوف الدراسية (يمكنك تدريس أكثر من صف):' : 'Grades Taught (Teacher can teach multi-grades):'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Grade 10', 'Grade 11', 'Grade 12'].map(grd => {
                        const isSelected = registerForm.grades.includes(grd);
                        return (
                          <button
                            key={grd}
                            type="button"
                            onClick={() => {
                              const nextGrades = isSelected
                                ? (registerForm.grades.length > 1 ? registerForm.grades.filter(g => g !== grd) : registerForm.grades)
                                : [...registerForm.grades, grd];
                              setRegisterForm({ ...registerForm, grades: nextGrades });
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {grd} {isSelected ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setRegisterStep(3)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Continue
                </button>
              </div>
            )}

            {registerStep === 3 && (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Create Password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setRegisterStep(4)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Send OTP
                </button>
              </div>
            )}

            {registerStep === 4 && (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-500">
                  Enter 4-digit code sent to your phone (Demo: 9876)
                </p>
                <input
                  type="text"
                  defaultValue="9876"
                  maxLength={4}
                  className="w-32 mx-auto tracking-widest text-center px-3 py-2 rounded-xl border-2 border-indigo-600 bg-white dark:bg-slate-800 text-base font-bold font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    registerUser({
                      name: `${registerForm.firstName} ${registerForm.lastName}`.trim() || (registerRole === 'student' ? 'Ahmed Mohamed' : 'Mr. Ahmed Hassan'),
                      phone: registerForm.phone || '+20 100 123 4567',
                      role: registerRole,
                      grade: registerForm.grade,
                      educationSystem: registerForm.system,
                      subjects: [registerForm.subject],
                      grades: registerForm.grades,
                      primaryCenterId: registerForm.centerId,
                      centerIds: ['center_60', 'center_modern'],
                      rating: 4.8
                    });
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Verify & Open KAYEDU
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(false);
                setRegisterStep(1);
              }}
              className="w-full mt-3 py-1.5 text-xs text-slate-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal (Section 9 workflow) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('forgotPassword')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {forgotStep === 1
                ? 'Enter your phone or email to receive a recovery code'
                : forgotStep === 2
                ? 'Verify 4-digit OTP code'
                : 'Set a new secure password'}
            </p>

            {forgotStep === 1 && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotInput}
                  onChange={e => setForgotInput(e.target.value)}
                  placeholder="Phone or Email"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setForgotStep(2)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Send OTP Code
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-3 text-center">
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={e => setForgotOtp(e.target.value)}
                  placeholder="Code (e.g. 1234)"
                  className="w-32 mx-auto tracking-widest text-center px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold font-mono"
                />
                <button
                  type="button"
                  onClick={() => setForgotStep(3)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Verify Code
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-3">
                <input
                  type="password"
                  value={forgotNewPass}
                  onChange={e => setForgotNewPass(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep(1);
                  }}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Save & Return to Login
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
              }}
              className="w-full mt-3 py-1.5 text-xs text-slate-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
