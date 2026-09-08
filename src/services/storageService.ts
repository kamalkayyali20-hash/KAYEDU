import {
  INITIAL_SESSIONS,
  INITIAL_ENROLLMENTS,
  INITIAL_HOMEWORK,
  INITIAL_EXAMS,
  INITIAL_PAYROLL,
  INITIAL_EXPENSES,
  INITIAL_TEACHER_SETTLEMENTS,
  INITIAL_TEACHER_NOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CENTERS,
  INITIAL_TEACHERS,
  INITIAL_EMPLOYEES,
  DEMO_USERS
} from './mockData';
import {
  Session,
  StudentSessionEnrollment,
  Homework,
  Exam,
  PayrollRecord,
  ExpenseRecord,
  TeacherSettlement,
  TeacherNote,
  NotificationItem,
  Center,
  Employee,
  User,
  QRTokenPayload,
  MaterialItem
} from '../types';

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(`kayedu_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`kayedu_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  // Users
  getUsers(): Record<string, User> {
    const users = this.get('users', DEMO_USERS);
    if (!users.student?.grade || !users.student?.centerIds?.includes('center_60')) {
      this.set('users', DEMO_USERS);
      return DEMO_USERS;
    }
    return users;
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    users[user.role] = user;
    users[user.id] = user;
    this.set('users', users);
  }

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    // find user by id or by role key
    for (const key of Object.keys(users)) {
      if (users[key]?.id === userId || key === userId) {
        users[key] = { ...users[key], ...updates };
        this.set('users', users);
        return users[key];
      }
    }
    return undefined;
  }

  // Sessions
  getSessions(): Session[] {
    const sessions = this.get('sessions', INITIAL_SESSIONS);
    if (!sessions.some(s => s.centerId === 'center_60' || s.id.includes('60'))) {
      this.set('sessions', INITIAL_SESSIONS);
      return INITIAL_SESSIONS;
    }
    return sessions;
  }

  saveSessions(sessions: Session[]): void {
    this.set('sessions', sessions);
  }

  addSession(session: Session): void {
    const sessions = this.getSessions();
    this.set('sessions', [session, ...sessions]);
  }

  // Enrollments
  getEnrollments(): StudentSessionEnrollment[] {
    const enrollments = this.get('enrollments', INITIAL_ENROLLMENTS);
    if (!enrollments.some(e => e.id.includes('60') || e.sessionId.includes('60'))) {
      this.set('enrollments', INITIAL_ENROLLMENTS);
      return INITIAL_ENROLLMENTS;
    }
    return enrollments;
  }

  saveEnrollments(enrollments: StudentSessionEnrollment[]): void {
    this.set('enrollments', enrollments);
  }

  enrollStudent(
    student: User,
    sessionId: string,
    paymentMethod: 'online_card' | 'digital_wallet' | 'center_cash' = 'center_cash'
  ): StudentSessionEnrollment | null {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const enrollments = this.getEnrollments();
    const existing = enrollments.find(e => e.sessionId === sessionId && e.studentId === student.id);
    if (existing) {
      return existing;
    }

    session.enrolledCount = (session.enrolledCount || 0) + 1;
    this.saveSessions(sessions);

    const isPaid = paymentMethod !== 'center_cash';
    const newEnrollment: StudentSessionEnrollment = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      studentId: student.id,
      studentName: student.name,
      studentCode: (student as any).studentCode || `ST-${Math.floor(100000 + Math.random() * 900000)}`,
      studentAvatar: student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      paymentStatus: isPaid ? 'PAID' : 'PENDING',
      paymentMethod,
      paidAmount: isPaid ? session.priceEgp : undefined,
      paidAt: isPaid ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      receiptNumber: isPaid ? `REC-${session.centerId === 'center_60' ? '60' : 'MOD'}-${Date.now().toString().slice(-6)}` : undefined,
      reservationStatus: 'CONFIRMED'
    };

    this.saveEnrollments([newEnrollment, ...enrollments]);
    return newEnrollment;
  }

  updateEnrollment(id: string, updates: Partial<StudentSessionEnrollment>): StudentSessionEnrollment | undefined {
    const list = this.getEnrollments();
    const index = list.findIndex(e => e.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.saveEnrollments(list);
      return list[index];
    }
    return undefined;
  }

  // Centers
  getCenters(): Center[] {
    const centers = this.get('centers', INITIAL_CENTERS);
    if (!centers.some(c => c.id === 'center_60')) {
      this.set('centers', INITIAL_CENTERS);
      return INITIAL_CENTERS;
    }
    return centers;
  }

  // Teachers
  getTeachers() {
    const teachers = this.get('teachers', INITIAL_TEACHERS);
    if (!teachers.some(t => t.userId === 'user_teacher_hesham' || t.centerIds.includes('center_60'))) {
      this.set('teachers', INITIAL_TEACHERS);
      return INITIAL_TEACHERS;
    }
    return teachers;
  }

  updateTeacherRating(teacherId: string, newScore: number) {
    const teachers = this.getTeachers();
    const t = teachers.find(item => item.userId === teacherId);
    if (t) {
      const totalPoints = t.rating * t.ratingCount + newScore;
      t.ratingCount += 1;
      t.rating = parseFloat((totalPoints / t.ratingCount).toFixed(2));
      const star = Math.min(5, Math.max(1, Math.round(newScore))) as 1|2|3|4|5;
      t.ratingDistribution[star] = (t.ratingDistribution[star] || 0) + 1;
      this.set('teachers', teachers);
    }
    return t;
  }

  // Materials
  getMaterials(): MaterialItem[] {
    return this.get('materials', [
      {
        id: 'mat_1',
        title: 'Physics Chapter 1 Summary — Vectors & Motion Notes (PDF)',
        subject: 'Physics',
        grade: 'Grade 11',
        teacherName: 'Mr. Ahmed Hassan',
        type: 'pdf',
        fileSize: '4.2 MB',
        url: '#',
        date: '2026-09-05'
      },
      {
        id: 'mat_2',
        title: 'Comprehensive Organic Chemistry Formulas & Functional Groups',
        subject: 'Chemistry',
        grade: 'Grade 11',
        teacherName: 'Dr. Mona El-Sayed',
        type: 'pdf',
        fileSize: '3.1 MB',
        url: '#',
        date: '2026-09-06'
      }
    ]);
  }

  // Homework
  getHomework(): Homework[] {
    const homework = this.get('homework', INITIAL_HOMEWORK);
    if (!homework.some(h => h.centerId === 'center_60' || h.id.includes('60'))) {
      this.set('homework', INITIAL_HOMEWORK);
      return INITIAL_HOMEWORK;
    }
    return homework;
  }

  addHomework(hw: Homework): void {
    const list = this.getHomework();
    this.set('homework', [hw, ...list]);
  }

  // Exams
  getExams(): Exam[] {
    const exams = this.get('exams', INITIAL_EXAMS);
    if (!exams.some(e => e.centerId === 'center_60' || e.id.includes('60'))) {
      this.set('exams', INITIAL_EXAMS);
      return INITIAL_EXAMS;
    }
    return exams;
  }

  addExam(exam: Exam): void {
    const list = this.getExams();
    this.set('exams', [exam, ...list]);
  }

  // Employees & Payroll
  getEmployees(): Employee[] {
    return this.get('employees', INITIAL_EMPLOYEES);
  }

  getPayroll(): PayrollRecord[] {
    return this.get('payroll', INITIAL_PAYROLL);
  }

  updatePayrollStatus(id: string, status: PayrollRecord['status']): void {
    const list = this.getPayroll();
    const item = list.find(p => p.id === id);
    if (item) {
      item.status = status;
      if (status === 'PAID') {
        item.paidAt = new Date().toISOString().split('T')[0];
      }
      this.set('payroll', list);
    }
  }

  // Expenses
  getExpenses(): ExpenseRecord[] {
    return this.get('expenses', INITIAL_EXPENSES);
  }

  addExpense(exp: ExpenseRecord): void {
    const list = this.getExpenses();
    this.set('expenses', [exp, ...list]);
  }

  // Settlements
  getSettlements(): TeacherSettlement[] {
    return this.get('settlements', INITIAL_TEACHER_SETTLEMENTS);
  }

  updateSettlementStatus(id: string, status: TeacherSettlement['status']): void {
    const list = this.getSettlements();
    const item = list.find(s => s.id === id);
    if (item) {
      item.status = status;
      if (status === 'PAID') {
        item.paidAmountEgp = item.teacherShareEgp;
        item.paidAt = new Date().toISOString().split('T')[0];
      }
      this.set('settlements', list);
    }
  }

  // Teacher Notes
  getTeacherNotes(): TeacherNote[] {
    return this.get('notes', INITIAL_TEACHER_NOTES);
  }

  addTeacherNote(note: TeacherNote): void {
    const list = this.getTeacherNotes();
    this.set('notes', [note, ...list]);
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.get('notifications', INITIAL_NOTIFICATIONS);
  }

  addNotification(notif: NotificationItem): void {
    const list = this.getNotifications();
    this.set('notifications', [notif, ...list]);
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.set('notifications', list);
  }

  // Reset demo data helper
  resetAllDemoData(): void {
    localStorage.removeItem('kayedu_sessions');
    localStorage.removeItem('kayedu_enrollments');
    localStorage.removeItem('kayedu_homework');
    localStorage.removeItem('kayedu_exams');
    localStorage.removeItem('kayedu_payroll');
    localStorage.removeItem('kayedu_expenses');
    localStorage.removeItem('kayedu_settlements');
    localStorage.removeItem('kayedu_notes');
    localStorage.removeItem('kayedu_notifications');
    localStorage.removeItem('kayedu_teachers');
  }
}

export const storageService = new StorageService();
