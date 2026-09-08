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
    return this.get('users', DEMO_USERS);
  }

  // Sessions
  getSessions(): Session[] {
    return this.get('sessions', INITIAL_SESSIONS);
  }

  saveSessions(sessions: Session[]): void {
    this.set('sessions', sessions);
  }

  // Enrollments
  getEnrollments(): StudentSessionEnrollment[] {
    return this.get('enrollments', INITIAL_ENROLLMENTS);
  }

  saveEnrollments(enrollments: StudentSessionEnrollment[]): void {
    this.set('enrollments', enrollments);
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
    return this.get('centers', INITIAL_CENTERS);
  }

  // Teachers
  getTeachers() {
    return this.get('teachers', INITIAL_TEACHERS);
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
    return this.get('homework', INITIAL_HOMEWORK);
  }

  addHomework(hw: Homework): void {
    const list = this.getHomework();
    this.set('homework', [hw, ...list]);
  }

  // Exams
  getExams(): Exam[] {
    return this.get('exams', INITIAL_EXAMS);
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
