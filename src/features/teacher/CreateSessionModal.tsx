import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Session } from '../../types';
import {
  X,
  PlusCircle,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (newSession: Session) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const userSubjects = user?.subjects && user.subjects.length > 0 ? user.subjects : ['Physics'];
  const userGrades = user?.grades && user.grades.length > 0 ? user.grades : ['Grade 10', 'Grade 11', 'Grade 12'];

  const [groupName, setGroupName] = useState('');
  const [subject, setSubject] = useState(userSubjects[0] || 'Physics');
  const [grade, setGrade] = useState<'Grade 10' | 'Grade 11' | 'Grade 12'>(
    (userGrades[0] as any) || 'Grade 10'
  );
  const [centerId, setCenterId] = useState<'center_60' | 'center_modern'>('center_60');
  const [room, setRoom] = useState('Hall 1 (Main)');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');
  const [priceEgp, setPriceEgp] = useState(200);
  const [capacity, setCapacity] = useState(40);
  const [isOnline, setIsOnline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم الحصة أو المجموعة' : 'Please enter a group or class title');
      return;
    }

    setIsSubmitting(true);

    const centerName = centerId === 'center_60' ? 'Center 60' : 'Center Modern';
    const centerNameAr = centerId === 'center_60' ? 'سنتر 60' : 'سنتر مودرن';
    const branchName = centerId === 'center_60' ? 'Nasr City Main Branch' : 'Mohandessin Main Branch';

    const newSession: Session = {
      id: `sess_${centerId}_${Date.now()}`,
      centerId,
      centerName,
      centerNameAr,
      branchName,
      teacherId: user?.id || 'user_teacher_1',
      teacherName: user?.name || 'Mr. Ahmed Hassan',
      teacherNameAr: user?.nameAr || 'أ. أحمد حسن',
      teacherAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      subject,
      grade,
      groupName: groupName.trim(),
      room,
      date,
      startTime,
      endTime,
      priceEgp: Number(priceEgp),
      isOnline,
      capacity: Number(capacity),
      enrolledCount: 0,
      status: 'SCHEDULED'
    };

    storageService.addSession(newSession);
    setCreatedSuccess(true);

    setTimeout(() => {
      onSessionCreated(newSession);
      setIsSubmitting(false);
      setCreatedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'إضافة حصة أو مجموعة جديدة' : 'Add New Class or Session'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'ستظهر الحصة فوراً لطلاب الصف المحدد في السنتر'
                  : 'Students of the selected grade can instantly view & enroll in this class.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {createdSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'تم إنشاء الحصة بنجاح! تم نشرها لجميع طلاب ' + grade
                  : `Class created successfully! Live now for all ${grade} students.`}
              </span>
            </div>
          )}

          {/* Group / Class Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'اسم الحصة أو عنوان الدرس:' : 'Class / Session Title:'}
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: مراجعة الميكانيكا وقوانين الحركة' : 'e.g., Physics Masterclass — Vectors & Dynamics'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Educational Center Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600" />
              {language === 'ar' ? 'السنتر التعليمي:' : 'Select Educational Center:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCenterId('center_60')}
                className={`p-3 rounded-2xl border text-start transition-all ${
                  centerId === 'center_60'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Center 60</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                    سنتر 60
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  مدينة نصر • عباس العقاد
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCenterId('center_modern')}
                className={`p-3 rounded-2xl border text-start transition-all ${
                  centerId === 'center_modern'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Center Modern</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                    سنتر مودرن
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  المهندسين • شارع سوريا
                </p>
              </button>
            </div>
          </div>

          {/* Grade & Subject Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Target Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                {language === 'ar' ? 'الصف الدراسي المستهدف:' : 'Target Grade:'}
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Grade 10">Grade 10 (الصف الأول الثانوي)</option>
                <option value="Grade 11">Grade 11 (الصف الثاني الثانوي)</option>
                <option value="Grade 12">Grade 12 (الصف الثالث الثانوي)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                {language === 'ar' ? 'المادة العلمية:' : 'Teaching Subject:'}
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Physics">Physics (فيزياء)</option>
                <option value="Chemistry">Chemistry (كيمياء)</option>
                <option value="Mathematics">Mathematics (رياضيات)</option>
                <option value="Biology">Biology (أحياء)</option>
                <option value="English Language">English (لغة إنجليزية)</option>
                <option value="Arabic Language">Arabic (لغة عربية)</option>
              </select>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {language === 'ar' ? 'التاريخ:' : 'Date:'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
              </input>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {language === 'ar' ? 'من:' : 'From:'}
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {language === 'ar' ? 'إلى:' : 'To:'}
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Room, Price, Capacity */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'القاعة:' : 'Hall/Room:'}
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="Hall 1"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'ar' ? 'السعر (EGP):' : 'Price (EGP):'}
              </label>
              <input
                type="number"
                min={50}
                max={2000}
                required
                value={priceEgp}
                onChange={e => setPriceEgp(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {language === 'ar' ? 'السعة القصوى:' : 'Capacity:'}
              </label>
              <input
                type="number"
                min={5}
                max={150}
                required
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isOnline ? (language === 'ar' ? 'حصة أونلاين عبر البث المباشر' : 'Online Livestream Class') : (language === 'ar' ? 'حضور بالسنتر في القاعة' : 'In-Center Attendance')}
              </span>
              <span className="text-[10px] text-slate-500">
                {isOnline ? 'Online zoom/stream link will be generated' : 'Students will scan QR ticket at reception'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isOnline
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
              }`}
            >
              {isOnline ? 'Online' : 'In-Center'}
            </button>
          </div>

          {/* Summary notice */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-[11px] text-indigo-900 dark:text-indigo-300">
            <strong>{language === 'ar' ? 'ملاحظة:' : 'Notice:'}</strong>{' '}
            {language === 'ar'
              ? `سيتم عرض هذه الحصة فقط لطلاب (${grade}) المشتركين في ${centerId === 'center_60' ? 'سنتر 60' : 'سنتر مودرن'}.`
              : `This class will automatically be targeted to ${grade} students at ${centerId === 'center_60' ? 'Center 60' : 'Center Modern'}.`}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (language === 'ar' ? 'إنشاء الحصة ونشرها للطلاب' : 'Create & Publish Class')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
