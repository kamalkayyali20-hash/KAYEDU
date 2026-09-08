import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService, reservationService, sessionService } from '../../services';
import { storageService } from '../../services/storageService';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  CheckCircle2,
  Building,
  Calendar,
  Clock,
  X,
  Sparkles,
  Users,
  Award,
  Video,
  DoorOpen,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Session } from '../../types';

export const StudentExplore: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [selectedGrade, setSelectedGrade] = useState<string>(user?.grade || 'Grade 10');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.grade) {
      setSelectedGrade(user.grade);
    }
  }, [user?.grade]);

  // Reservation dialog
  const [selectedGroupSession, setSelectedGroupSession] = useState<Session | null>(null);
  const [reservationResult, setReservationResult] = useState<{ status: string; message: string } | null>(null);

  // Interactive rating dialog
  const [userRatingScore, setUserRatingScore] = useState<number>(5);
  const [hasRated, setHasRated] = useState(false);

  // Ranked teachers based on section 17
  const teachers = teacherService.rankTeachers(selectedSubject, selectedGrade, query);

  const selectedTeacher = teachers.find(t => t.userId === selectedTeacherId) ||
    teacherService.getTeacherById(selectedTeacherId || '');

  const availableSessions = storageService.getSessions().filter(s => s.teacherId === selectedTeacher?.userId);

  const handleReserve = (session: Session) => {
    try {
      const res = reservationService.reserveSeat(session.id, user!);
      storageService.enrollStudent(user!, session.id, 'center_cash');
      setReservationResult({ status: res.status, message: res.message });
      setSelectedGroupSession(session);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRateTeacher = (rating: number) => {
    if (!selectedTeacher) return;
    teacherService.rateTeacher(selectedTeacher.userId, rating);
    setUserRatingScore(rating);
    setHasRated(true);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Search & Discovery Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'ar' ? 'استكشاف المعلمين والمجموعات' : 'Explore Top Educators'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'ar'
            ? 'احجز مقعدك في أفضل السناتر التعليمية مع نخبة مدرسي الثانوية العامة'
            : 'Find top-rated verified tutors, view schedules, and reserve group seats.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute top-3 inset-s-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('searchTeachersPlaceholder')}
          className="w-full ps-9 pe-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm transition-all"
        />
      </div>

      {/* Filter Chips: Subjects & Grades */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Arabic'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(selectedSubject === sub ? '' : sub)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['Grade 10', 'Grade 11', 'Grade 12'].map(grd => (
            <button
              key={grd}
              onClick={() => setSelectedGrade(selectedGrade === grd ? '' : grd)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedGrade === grd
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {grd}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
        <span>{teachers.length} verified educators found</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Ranked by verified student ratings & subject relevance
        </span>
      </div>

      {/* Teacher Cards Grid (Journey 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {teachers.map(teacher => (
          <div
            key={teacher.userId}
            onClick={() => setSelectedTeacherId(teacher.userId)}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
                  />
                  {teacher.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900" title="Verified Educator">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {language === 'ar' ? teacher.nameAr || teacher.name : teacher.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{teacher.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    {teacher.subjects.join(' • ')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {teacher.grades.join(', ')} • {teacher.experienceYears} yrs experience
                  </p>
                </div>
              </div>

              {/* Bio excerpt */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                {language === 'ar' ? teacher.bioAr || teacher.bio : teacher.bio}
              </p>

              {/* Centers Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 truncate max-w-[220px]">
                  {teacher.centersNames.join(', ')}
                </span>
                {teacher.onlineAvailable && (
                  <span className="ms-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <Video className="w-3 h-3" /> Online
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500 text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{teacher.rating.toFixed(1)}</span>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>{t('reserveSeat')}</span>
                {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Profile & Reservation Modal (Section 18 & 20) */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh] space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-indigo-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {language === 'ar' ? selectedTeacher.nameAr || selectedTeacher.name : selectedTeacher.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {selectedTeacher.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedTeacher.experienceYears} years coaching Thanweya Amma
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ratings Card (Shows star score like 4.7 / 5.0, hides raw vote count) */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedTeacher.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">/ 5.0</span>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-100/80 dark:bg-amber-900/40 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {selectedTeacher.rating >= 4.8 ? 'Top Ranked Educator' : 'Highly Recommended'}
                </span>
              </div>

              {/* Distribution bars */}
              <div className="space-y-1 text-[11px]">
                {[
                  { star: 5, pct: selectedTeacher.ratingDistribution[5] || 75 },
                  { star: 4, pct: selectedTeacher.ratingDistribution[4] || 18 },
                  { star: 3, pct: selectedTeacher.ratingDistribution[3] || 5 },
                  { star: 2, pct: selectedTeacher.ratingDistribution[2] || 1 },
                  { star: 1, pct: selectedTeacher.ratingDistribution[1] || 1 }
                ].map(row => (
                  <div key={row.star} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-3 font-mono">{row.star}★</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-end font-mono text-[10px]">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Verified Student Rating action */}
              <div className="mt-3 pt-2.5 border-t border-amber-200/50 dark:border-amber-900/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {hasRated ? 'Thank you for rating!' : 'Rate this Educator:'}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRateTeacher(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRatingScore
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                About & Teaching Methodology
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === 'ar' ? selectedTeacher.bioAr || selectedTeacher.bio : selectedTeacher.bio}
              </p>
            </div>

            {/* Available Groups & Reservation (Section 20 & 21) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Groups & Schedules
                </h4>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Select group to reserve
                </span>
              </div>

              <div className="space-y-2">
                {availableSessions.map(session => {
                  const isFull = session.enrolledCount >= session.capacity;
                  const availableSeats = Math.max(0, session.capacity - session.enrolledCount);

                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {session.groupName}
                          </span>
                          {isFull ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                              {t('classFull')}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                              {availableSeats} seats left
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span>{session.centerName} • {session.room}</span>
                          <span>• {session.date} ({session.startTime})</span>
                        </p>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                          {session.priceEgp} EGP / session
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReserve(session)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isFull
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isFull ? t('joinWaitingList') : t('reserveSeat')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reservation Result Toast / Modal */}
            {reservationResult && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm">
                    {reservationResult.status === 'CONFIRMED'
                      ? t('reservationSuccess')
                      : t('waitingListSuccess')}
                  </h5>
                  <p className="mt-0.5 text-xs opacity-90">{reservationResult.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
