import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role } from '../../types';
import {
  X,
  GraduationCap,
  Briefcase,
  UserCheck,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Check,
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Layers
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'student' | 'teacher';
}

const EGYPTIAN_STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
];

const EGYPTIAN_TEACHER_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'student'
}) => {
  const { login, loginAsDemo, registerUser } = useAuth();
  const { language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('student@kayedu.demo');
  const [loginPass, setLoginPass] = useState('123456');

  // Student Register Form
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('+20 100 ');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 11');
  const [studentSystem, setStudentSystem] = useState('Thanaweya Amma');
  const [studentCenter, setStudentCenter] = useState('center_60');
  const [studentAvatar, setStudentAvatar] = useState(EGYPTIAN_STUDENT_AVATARS[0]);

  // Teacher Register Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('+20 100 ');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Physics');
  const [teacherGrades, setTeacherGrades] = useState<string[]>(['Grade 10', 'Grade 11', 'Grade 12']);
  const [teacherCenter, setTeacherCenter] = useState('center_60');
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherAvatar, setTeacherAvatar] = useState(EGYPTIAN_TEACHER_AVATARS[0]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const toggleTeacherGrade = (g: string) => {
    if (teacherGrades.includes(g)) {
      if (teacherGrades.length > 1) {
        setTeacherGrades(teacherGrades.filter(item => item !== g));
      }
    } else {
      setTeacherGrades([...teacherGrades, g]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginEmail, loginPass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'student') {
      if (!studentName.trim()) {
        setError(language === 'ar' ? 'يرجى إدخال اسم الطالب' : 'Please enter student name');
        return;
      }
      registerUser({
        name: studentName,
        email: studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '')}@kayedu.demo`,
        phone: studentPhone,
        role: 'student',
        grade: studentGrade,
        educationSystem: studentSystem,
        primaryCenterId: studentCenter,
        centerIds: [studentCenter, studentCenter === 'center_60' ? 'center_modern' : 'center_60'],
        avatarUrl: studentAvatar
      });
      setSuccess(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account registered successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      if (!teacherName.trim()) {
        setError(language === 'ar' ? 'يرجى إدخال اسم المعلم' : 'Please enter teacher name');
        return;
      }
      if (teacherGrades.length === 0) {
        setError(language === 'ar' ? 'يرجى اختيار صف دراسي واحد على الأقل' : 'Please select at least one grade');
        return;
      }
      registerUser({
        name: teacherName,
        email: teacherEmail || `${teacherName.toLowerCase().replace(/\s+/g, '')}@kayedu.demo`,
        phone: teacherPhone,
        role: 'teacher',
        subjects: [teacherSubject],
        grades: teacherGrades,
        primaryCenterId: teacherCenter,
        centerIds: [teacherCenter, teacherCenter === 'center_60' ? 'center_modern' : 'center_60'],
        bio: teacherBio || `Certified ${teacherSubject} master educator teaching ${teacherGrades.join(', ')}.`,
        avatarUrl: teacherAvatar,
        rating: 4.8
      });
      setSuccess(language === 'ar' ? 'تم تسجيل المعلم بنجاح!' : 'Educator profile created!');
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              K
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {mode === 'login'
                  ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                  : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'سنتر 60 وسنتر مودرن' : 'Center 60 & Center Modern Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle: Login vs Register */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'ar' ? 'تسجيل حساب جديد' : 'Register'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}

        {mode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'البريد الإلكتروني أو الهاتف' : 'Email or Phone'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="student@kayedu.demo"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              {language === 'ar' ? 'دخول فوري' : 'Sign In Now'}
            </button>

            {/* Quick Demo Swapper */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                {language === 'ar' ? 'أو تجربة الحسابات السريعة:' : 'Or sign in with 1-click demo account:'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    await loginAsDemo('student');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-start flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span>{language === 'ar' ? 'أحمد محمد (طالب)' : 'Student (Ahmed)'}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">G11 • Center 60 & Modern</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await loginAsDemo('teacher');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-start flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span>{language === 'ar' ? 'أ. أحمد حسن (مدرس)' : 'Teacher (Mr. Ahmed)'}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Physics • 3 Grades</span>
                  </div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Switcher in Register */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'نوع الحساب المراد تسجيله:' : 'Registering as:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border text-start flex items-center gap-3 transition-all ${
                    role === 'student'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{language === 'ar' ? 'طالب ثانوية عامة' : 'Student'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'ar' ? 'حجز الحصص والواجبات' : 'Select grade'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 rounded-2xl border text-start flex items-center gap-3 transition-all ${
                    role === 'teacher'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{language === 'ar' ? 'معلم / مدرس سنتر' : 'Educator / Teacher'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'ar' ? 'تدريس عدة صفوف' : 'Multi-grade coach'}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Common Fields: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={role === 'student' ? studentName : teacherName}
                    onChange={e => role === 'student' ? setStudentName(e.target.value) : setTeacherName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Youssef Karim' : 'e.g. Mr. Mahmoud Taha'}
                    className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'رقم الهاتف (مصر)' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={role === 'student' ? studentPhone : teacherPhone}
                    onChange={e => role === 'student' ? setStudentPhone(e.target.value) : setTeacherPhone(e.target.value)}
                    placeholder="+20 100 1234567"
                    className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* STUDENT SPECIFIC REQUIREMENT: "in the regester to write which grade i am with" */}
            {role === 'student' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-400">
                  <GraduationCap className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تحديد الصف الدراسي (إلزامي)' : 'Which Grade Are You In? (Required)'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Grade 10', en: 'Grade 10', ar: 'الصف الأول الثانوي' },
                    { id: 'Grade 11', en: 'Grade 11', ar: 'الصف الثاني الثانوي' },
                    { id: 'Grade 12', en: 'Grade 12', ar: 'الصف الثالث الثانوي' }
                  ].map(grd => (
                    <button
                      key={grd.id}
                      type="button"
                      onClick={() => setStudentGrade(grd.id)}
                      className={`p-2.5 rounded-xl text-center border font-bold text-xs transition-all ${
                        studentGrade === grd.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-black">{grd.id}</span>
                      <span className="block text-[9px] opacity-80 mt-0.5 truncate">{grd.ar}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ar' ? 'السنتر الأساسي' : 'Primary Center'}
                    </label>
                    <select
                      value={studentCenter}
                      onChange={e => setStudentCenter(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="center_60">Center 60 (سنتر 60 - مدينة نصر)</option>
                      <option value="center_modern">Center Modern (سنتر مودرن - المهندسين)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ar' ? 'نظام التعليم' : 'Education System'}
                    </label>
                    <select
                      value={studentSystem}
                      onChange={e => setStudentSystem(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="Thanaweya Amma">Thanaweya Amma (ثانوية عامة)</option>
                      <option value="Experimental Languages">Languages (لغات تجريبي)</option>
                      <option value="STEM">STEM High School</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Selection for Egyptian Student */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    {language === 'ar' ? 'اختر صورة الحساب:' : 'Select Student Profile Photo:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {EGYPTIAN_STUDENT_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setStudentAvatar(url)}
                        className={`relative rounded-xl overflow-hidden ring-2 transition-all ${
                          studentAvatar === url ? 'ring-indigo-600 scale-105' : 'ring-transparent opacity-70'
                        }`}
                      >
                        <img src={url} alt="avatar" className="w-10 h-10 object-cover" referrerPolicy="no-referrer" />
                        {studentAvatar === url && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER SPECIFIC REQUIREMENT: "for teacher to be which subject and which grades bec as a teacher i can teach more than 1 grade" */}
            {role === 'teacher' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="w-4 h-4" />
                  <span>{language === 'ar' ? 'المادة الدراسية والصفوف (يمكن تدريس أكثر من صف)' : 'Subject & Grades (Teacher Can Teach Multi-Grades)'}</span>
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ar' ? 'المادة الأساسية:' : 'Teaching Subject:'}
                  </label>
                  <select
                    value={teacherSubject}
                    onChange={e => setTeacherSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Physics">Physics (فيزياء)</option>
                    <option value="Chemistry">Chemistry (كيمياء)</option>
                    <option value="Mathematics">Pure Mathematics (رياضيات بحتة وتفاضل)</option>
                    <option value="Applied Mathematics">Applied Math (ميكانيكا واستاتيكا)</option>
                    <option value="Biology">Biology & Geology (أحياء وجيولوجيا)</option>
                    <option value="English Language">English Language (لغة إنجليزية)</option>
                    <option value="Arabic Language">Arabic Language (لغة عربية وبلاغة)</option>
                  </select>
                </div>

                {/* Multi-Grade Checkboxes ("bec as a teacher i can teach more than 1 grade") */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الصفوف الدراسية التي تدرسها (اختر كل ما ينطبق):' : 'Grades Taught (Select all that apply):'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Grade 10', en: 'Grade 10', ar: 'أولى ثانوي' },
                      { id: 'Grade 11', en: 'Grade 11', ar: 'تانية ثانوي' },
                      { id: 'Grade 12', en: 'Grade 12', ar: 'تالتة ثانوي' }
                    ].map(grd => {
                      const isSelected = teacherGrades.includes(grd.id);
                      return (
                        <button
                          key={grd.id}
                          type="button"
                          onClick={() => toggleTeacherGrade(grd.id)}
                          className={`p-2.5 rounded-xl text-center border font-bold text-xs transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{grd.id}</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-[10px] opacity-80 mt-0.5">{grd.ar}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
                    ✓ {teacherGrades.length} {language === 'ar' ? 'صفوف دراسية محددة' : 'grades selected for this educator'}
                  </p>
                </div>

                {/* Center affiliation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ar' ? 'السنتر التعليمي التابع له:' : 'Affiliated Educational Center:'}
                  </label>
                  <select
                    value={teacherCenter}
                    onChange={e => setTeacherCenter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="center_60">Center 60 (سنتر 60 - مدينة نصر والتجمع)</option>
                    <option value="center_modern">Center Modern (سنتر مودرن - المهندسين والدقي)</option>
                  </select>
                </div>

                {/* Avatar Selection for Egyptian Teacher */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    {language === 'ar' ? 'اختر صورة المعلم:' : 'Select Educator Profile Photo:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {EGYPTIAN_TEACHER_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTeacherAvatar(url)}
                        className={`relative rounded-xl overflow-hidden ring-2 transition-all ${
                          teacherAvatar === url ? 'ring-emerald-600 scale-105' : 'ring-transparent opacity-70'
                        }`}
                      >
                        <img src={url} alt="avatar" className="w-10 h-10 object-cover" referrerPolicy="no-referrer" />
                        {teacherAvatar === url && (
                          <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>
                {role === 'student'
                  ? (language === 'ar' ? `تسجيل كطالب في ${studentGrade}` : `Register as Student (${studentGrade})`)
                  : (language === 'ar' ? `تسجيل كمعلم (${teacherGrades.length} صفوف)` : `Register as Educator (${teacherGrades.length} Grades)`)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
