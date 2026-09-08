import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import {
  User,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  Building,
  Star,
  CheckCircle2,
  Save,
  QrCode,
  Sparkles,
  ShieldCheck,
  Edit3,
  LogOut,
  UserCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { QRDisplayModal } from '../../components/common/QRDisplayModal';

interface ProfileViewProps {
  onOpenAuthModal?: () => void;
}

const EGYPTIAN_AVATARS_STUDENT = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
];

const EGYPTIAN_AVATARS_TEACHER = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuthModal }) => {
  const { user, updateUser, logout } = useAuth();
  const { language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Form State initialized from user
  const [name, setName] = useState(user?.name || '');
  const [nameAr, setNameAr] = useState(user?.nameAr || '');
  const [phone, setPhone] = useState(user?.phone || '+20 100 124 5890');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Student specific
  const [grade, setGrade] = useState(user?.grade || 'Grade 11');
  const [educationSystem, setEducationSystem] = useState(user?.educationSystem || 'Thanaweya Amma');

  // Teacher specific
  const [subject, setSubject] = useState(user?.subjects?.[0] || 'Physics');
  const [grades, setGrades] = useState<string[]>(user?.grades || ['Grade 10', 'Grade 11', 'Grade 12']);
  const [bio, setBio] = useState(user?.bio || '');

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const toggleTeacherGrade = (g: string) => {
    if (grades.includes(g)) {
      if (grades.length > 1) {
        setGrades(grades.filter(item => item !== g));
      }
    } else {
      setGrades([...grades, g]);
    }
  };

  const handleSave = () => {
    updateUser({
      name,
      nameAr,
      phone,
      email,
      avatarUrl,
      grade: isStudent ? grade : undefined,
      educationSystem: isStudent ? educationSystem : undefined,
      subjects: isTeacher ? [subject] : undefined,
      grades: isTeacher ? grades : undefined,
      bio: isTeacher ? bio : undefined
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentAvatarList = isTeacher ? EGYPTIAN_AVATARS_TEACHER : EGYPTIAN_AVATARS_STUDENT;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'ar' ? 'الملف الشخصي والبيانات' : 'Profile & Account Settings'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'عرض وتعديل بياناتك في سنتر 60 وسنتر مودرن'
              : 'Manage your verified profile details for Center 60 & Center Modern'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل / تبديل حساب' : 'Login / Register Form'}</span>
            </button>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تعديل البيانات' : 'Edit Profile'}</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? 'تم حفظ التعديلات بنجاح في قاعدة البيانات!' : 'Profile updated and saved successfully!'}</span>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl || user?.avatarUrl}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs shadow-md ring-2 ring-white dark:ring-slate-900">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {name || user?.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {user?.role.toUpperCase()}
                </span>
              </div>

              {nameAr && (
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {nameAr}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                {isStudent && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    {grade} • {educationSystem}
                  </span>
                )}

                {isTeacher && (
                  <>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      {subject}
                    </span>
                    {/* Star rating displayed without raw vote count */}
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 border border-amber-200/50 dark:border-amber-900/50">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {(user?.rating || 4.8).toFixed(1)}
                    </span>
                  </>
                )}

                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  Center 60 & Modern
                </span>
              </div>
            </div>
          </div>

          {isStudent && (
            <button
              onClick={() => setShowQR(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-2 text-xs font-bold border border-indigo-200 dark:border-indigo-800"
            >
              <QrCode className="w-4 h-4" />
              <span>{language === 'ar' ? 'كود الطالب الرقمي' : 'Student ID & QR'}</span>
            </button>
          )}
        </div>

        {/* Egyptian Avatar Picker (Visible in edit mode) */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'ar' ? 'اختر صورة الحساب:' : 'Select Egyptian Profile Portrait:'}
            </p>
            <div className="flex items-center gap-3">
              {currentAvatarList.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-2xl overflow-hidden ring-2 transition-all ${
                    avatarUrl === url ? 'ring-indigo-600 scale-105 shadow-md' : 'ring-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="portrait" className="w-12 h-12 object-cover" referrerPolicy="no-referrer" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Details & Editing Form */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {language === 'ar' ? 'البيانات الأساسية' : 'Personal & Contact Information'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-80"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'الاسم بالعربية' : 'Name in Arabic'}
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-80"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'رقم الهاتف (مصر)' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
              <input
                type="tel"
                disabled={!isEditing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold font-mono text-slate-900 dark:text-white disabled:opacity-80"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-80"
              />
            </div>
          </div>
        </div>

        {/* STUDENT SPECIFIC EDITABLE FIELDS */}
        {isStudent && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>{language === 'ar' ? 'المرحلة والصف الدراسي (يمكنك التغيير هنا)' : 'Grade & Academic System (Editable)'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الصف الدراسي الحالي:' : 'Current Grade:'}
                </label>
                {isEditing ? (
                  <select
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-indigo-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Grade 10">Grade 10 (الصف الأول الثانوي)</option>
                    <option value="Grade 11">Grade 11 (الصف الثاني الثانوي)</option>
                    <option value="Grade 12">Grade 12 (الصف الثالث الثانوي - ثانوية عامة)</option>
                  </select>
                ) : (
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    {grade}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'نظام التعليم:' : 'Education System:'}
                </label>
                {isEditing ? (
                  <select
                    value={educationSystem}
                    onChange={e => setEducationSystem(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Thanaweya Amma">Thanaweya Amma (ثانوية عامة عام)</option>
                    <option value="Languages / Experimental">Languages / Experimental (تجريبي لغات)</option>
                    <option value="STEM High School">STEM High School (ستيم للمتفوقين)</option>
                    <option value="IGCSE / British">IGCSE (النظام البريطاني)</option>
                  </select>
                ) : (
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    {educationSystem}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEACHER SPECIFIC EDITABLE FIELDS: "for teacher to be which subject and which grades bec as a teacher i can teach more than 1 grade" */}
        {isTeacher && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{language === 'ar' ? 'تخصص المعلم والصفوف الدراسية' : 'Teacher Subject & Multi-Grade Allocation'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'المادة التي تقوم بتدريسها:' : 'Subject:'}
                </label>
                {isEditing ? (
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Physics">Physics (فيزياء)</option>
                    <option value="Chemistry">Chemistry (كيمياء)</option>
                    <option value="Mathematics">Pure Mathematics (رياضيات بحتة وتفاضل)</option>
                    <option value="Applied Mathematics">Applied Math (ميكانيكا واستاتيكا)</option>
                    <option value="Biology">Biology & Geology (أحياء وجيولوجيا)</option>
                    <option value="English Language">English Language (لغة إنجليزية)</option>
                    <option value="Arabic Language">Arabic Language (لغة عربية)</option>
                  </select>
                ) : (
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    {subject}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الصفوف الدراسية التي تدرسها (متعددة):' : 'Grades Taught (Teacher can teach multi-grades):'}
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-1.5">
                    {['Grade 10', 'Grade 11', 'Grade 12'].map(grd => {
                      const isSelected = grades.includes(grd);
                      return (
                        <button
                          key={grd}
                          type="button"
                          onClick={() => toggleTeacherGrade(grd)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {grd} {isSelected ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {grades.map(g => (
                      <span key={g} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'نبذة عن المعلم والخبرات:' : 'Educator Biography:'}
              </label>
              <textarea
                disabled={!isEditing}
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Write your experience, teaching style and center affiliations..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white disabled:opacity-80"
              />
            </div>
          </div>
        )}

        {/* Save button if in edit mode */}
        {isEditing && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ كافة التعديلات' : 'Save All Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Connected Centers Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-indigo-600" />
          <span>{language === 'ar' ? 'السناتر والمراكز المشترك بها' : 'Connected Educational Centers'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white">Center 60 (سنتر 60)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Nasr City & 5th Settlement</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              Active Member
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white">Center Modern (سنتر مودرن)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Mohandessin & Dokki</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              Active Member
            </span>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Student */}
      {showQR && (
        <QRDisplayModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          studentName={name}
          studentCode="ST-001245"
          sessionInfo={
            isStudent
              ? `Center 60 & Center Modern • ${grade}`
              : `Center 60 & Center Modern • ${subject}`
          }
          paymentStatus="PAID"
        />
      )}
    </div>
  );
};
