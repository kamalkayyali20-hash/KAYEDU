import { storageService } from './storageService';
import { DEMO_USERS } from './mockData';
import {
  User,
  Session,
  StudentSessionEnrollment,
  PaymentStatus,
  AttendanceStatus,
  QRTokenPayload,
  TeacherSettlement,
  PayrollRecord,
  ExpenseRecord,
  Homework,
  Exam,
  AuditLog,
  ReservationStatus
} from '../types';

export const authService = {
  async login(emailOrPhone: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 450));

    const cleanInput = emailOrPhone.trim().toLowerCase();
    const users = storageService.getUsers();

    // Match demo accounts or email
    for (const key of Object.keys(users)) {
      const u = users[key];
      if (u.email.toLowerCase() === cleanInput || u.phone.includes(cleanInput)) {
        if (password === '123456' || password.length >= 6) {
          return u;
        }
      }
    }

    // Default student demo if not matched
    if (cleanInput.includes('student') || cleanInput === 'student') return users.student;
    if (cleanInput.includes('teacher') || cleanInput === 'teacher') return users.teacher;
    if (cleanInput.includes('parent') || cleanInput === 'parent') return users.parent;
    if (cleanInput.includes('owner') || cleanInput === 'owner') return users.center_owner;
    if (cleanInput.includes('reception') || cleanInput.includes('staff')) return users.center_staff;
    if (cleanInput.includes('admin')) return users.super_admin;

    throw new Error('Invalid credentials. For demo, use 123456 or click any Demo Account below.');
  },

  getCurrentUser(): User {
    const saved = localStorage.getItem('kayedu_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_USERS.student;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('kayedu_current_user', JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem('kayedu_current_user');
  }
};

export const sessionService = {
  getSessions(): Session[] {
    return storageService.getSessions();
  },

  getSessionById(id: string): Session | undefined {
    return storageService.getSessions().find(s => s.id === id);
  },

  getStudentEnrollments(studentId: string): StudentSessionEnrollment[] {
    return storageService.getEnrollments().filter(e => e.studentId === studentId);
  },

  getTeacherSessions(teacherId: string): Session[] {
    return storageService.getSessions().filter(s => s.teacherId === teacherId);
  },

  getSessionEnrollments(sessionId: string): StudentSessionEnrollment[] {
    return storageService.getEnrollments().filter(e => e.sessionId === sessionId);
  }
};

export const attendanceService = {
  generateQRToken(student: User, session: Session, enrollment: StudentSessionEnrollment): QRTokenPayload {
    const nonce = Math.random().toString(36).substring(2, 9);
    const expiresAt = Date.now() + 1000 * 60 * 2; // 2 minutes countdown
    const payload: QRTokenPayload = {
      token: `KAY-QR-${session.id}-${student.id}-${nonce}`,
      studentId: student.id,
      studentName: student.name,
      studentCode: enrollment.studentCode || 'ST-001245',
      studentAvatar: student.avatarUrl,
      sessionId: session.id,
      sessionTitle: `${session.subject} - ${session.grade}`,
      centerId: session.centerId,
      centerName: session.centerName,
      room: session.room,
      priceEgp: session.priceEgp,
      paymentStatus: enrollment.paymentStatus,
      expiresAt,
      nonce,
      status: 'valid'
    };
    return payload;
  },

  verifyQRToken(tokenPayload: QRTokenPayload, currentCenterId: string): {
    valid: boolean;
    error?: 'expired' | 'already_used' | 'wrong_center' | 'unpaid' | 'not_found';
    enrollment?: StudentSessionEnrollment;
    session?: Session;
  } {
    if (Date.now() > tokenPayload.expiresAt) {
      return { valid: false, error: 'expired' };
    }

    const session = sessionService.getSessionById(tokenPayload.sessionId);
    if (!session) {
      return { valid: false, error: 'not_found' };
    }

    // Tenant check
    if (session.centerId !== currentCenterId && currentCenterId !== 'center_kayedu') {
      return { valid: false, error: 'wrong_center' };
    }

    const enrollments = storageService.getEnrollments();
    const enrollment = enrollments.find(e => e.sessionId === session.id && e.studentId === tokenPayload.studentId);

    if (!enrollment) {
      return { valid: false, error: 'not_found' };
    }

    if (enrollment.attendanceStatus === 'PRESENT') {
      return { valid: false, error: 'already_used', enrollment, session };
    }

    return { valid: true, enrollment, session };
  },

  recordAttendance(
    enrollmentId: string,
    status: AttendanceStatus = 'PRESENT',
    actorName: string = 'Receptionist'
  ): StudentSessionEnrollment | undefined {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated = storageService.updateEnrollment(enrollmentId, {
      attendanceStatus: status,
      attendanceTime: timeStr
    });

    auditService.log({
      actorId: 'reception',
      actorName,
      actorRole: 'Reception Staff',
      action: 'RECORD_ATTENDANCE',
      resource: `Enrollment #${enrollmentId}`,
      timestamp: now.toISOString(),
      details: `Marked attendance as ${status} at ${timeStr}`
    });

    return updated;
  },

  verifyAndCheckInQR(codeOrToken: string, sessionId: string, staffUser: User) {
    if (codeOrToken.includes('INVALID')) {
      throw new Error('QR Token is invalid or has expired.');
    }

    const enrollments = storageService.getEnrollments();
    const session = storageService.getSessions().find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    // Find enrollment matching session or code
    let enrollment = enrollments.find(e =>
      e.sessionId === sessionId && (codeOrToken.includes(e.studentId) || e.studentCode === codeOrToken)
    );

    if (!enrollment) {
      enrollment = enrollments.find(e => e.studentCode === codeOrToken || codeOrToken.includes(e.studentId));
    }

    if (!enrollment) {
      // Fallback to first student for demo
      enrollment = enrollments[0];
    }

    const isPaid = enrollment.paymentStatus === 'PAID';
    const updated = storageService.updateEnrollment(enrollment.id, {
      attendanceStatus: 'PRESENT',
      attendanceTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return {
      success: true,
      enrollment: updated || enrollment,
      session,
      paymentStatus: enrollment.paymentStatus,
      requiresPayment: !isPaid,
      message: isPaid
        ? `Access Granted! ${enrollment.studentName} has pre-paid online.`
        : `Attendance recorded! Please collect ${session.priceEgp} EGP cash at reception desk.`
    };
  },

  collectCashAtReception(enrollmentId: string, sessionId: string, staffUser: User) {
    const updated = storageService.updateEnrollment(enrollmentId, {
      paymentStatus: 'PAID',
      paymentMethod: 'center_cash',
      paidAmount: 200,
      receiptNumber: `RCP-CASH-${Date.now().toString().slice(-6)}`
    });

    auditService.log({
      actorId: staffUser.id,
      actorName: staffUser.name,
      actorRole: staffUser.role,
      action: 'CASH_COLLECTION',
      resource: `Enrollment #${enrollmentId}`,
      timestamp: new Date().toISOString(),
      details: 'Collected 200 EGP cash at reception terminal'
    });

    return updated;
  }
};

export const paymentService = {
  async processOnlinePayment(
    enrollmentId: string,
    amountEgp: number,
    method: 'online_card' | 'digital_wallet'
  ): Promise<StudentSessionEnrollment> {
    await new Promise(r => setTimeout(r, 600));

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const paidAt = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = storageService.updateEnrollment(enrollmentId, {
      paymentStatus: 'PAID',
      paymentMethod: method,
      paidAmount: amountEgp,
      paidAt,
      receiptNumber
    });

    auditService.log({
      actorId: 'student',
      actorName: 'Student Online',
      actorRole: 'Student',
      action: 'ONLINE_PAYMENT',
      resource: `Enrollment #${enrollmentId}`,
      timestamp: now.toISOString(),
      details: `Paid ${amountEgp} EGP via ${method}, Receipt: ${receiptNumber}`
    });

    return updated!;
  },

  recordCashPaymentAtCenter(
    enrollmentId: string,
    amountEgp: number,
    receptionistName: string
  ): StudentSessionEnrollment {
    const receiptNumber = `CASH-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const paidAt = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = storageService.updateEnrollment(enrollmentId, {
      paymentStatus: 'PAID',
      paymentMethod: 'center_cash',
      paidAmount: amountEgp,
      paidAt,
      receiptNumber
    });

    auditService.log({
      actorId: 'staff',
      actorName: receptionistName,
      actorRole: 'Reception Staff',
      action: 'CASH_PAYMENT_COLLECTED',
      resource: `Enrollment #${enrollmentId}`,
      timestamp: now.toISOString(),
      details: `Collected ${amountEgp} EGP in cash at reception. Receipt: ${receiptNumber}`
    });

    return updated!;
  }
};

export const reservationService = {
  reserveSeat(sessionId: string, student: User): { status: ReservationStatus; message: string; enrollment: StudentSessionEnrollment } {
    const session = sessionService.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const enrollments = storageService.getEnrollments();
    const existing = enrollments.find(e => e.sessionId === sessionId && e.studentId === student.id);
    if (existing) {
      return { status: existing.reservationStatus, message: 'Already enrolled or reserved', enrollment: existing };
    }

    const isFull = session.enrolledCount >= session.capacity;
    const resStatus: ReservationStatus = isFull ? 'WAITLISTED' : 'CONFIRMED';

    const newEnrollment: StudentSessionEnrollment = {
      id: `enr_${Date.now()}`,
      sessionId,
      studentId: student.id,
      studentName: student.name,
      studentCode: 'ST-001245',
      studentAvatar: student.avatarUrl,
      paymentStatus: 'PENDING',
      reservationStatus: resStatus,
      waitingListPosition: isFull ? 3 : undefined
    };

    if (!isFull) {
      session.enrolledCount += 1;
      const allSessions = storageService.getSessions().map(s => s.id === sessionId ? session : s);
      storageService.saveSessions(allSessions);
    }

    storageService.saveEnrollments([...enrollments, newEnrollment]);

    auditService.log({
      actorId: student.id,
      actorName: student.name,
      actorRole: 'Student',
      action: isFull ? 'JOIN_WAITLIST' : 'RESERVE_SEAT',
      resource: `Session #${sessionId}`,
      timestamp: new Date().toISOString(),
      details: `Seat reservation created with status: ${resStatus}`
    });

    return {
      status: resStatus,
      message: isFull ? 'Class is full. Added to waiting list.' : 'Seat confirmed successfully!',
      enrollment: newEnrollment
    };
  }
};

export const teacherService = {
  getTeachers() {
    return storageService.getTeachers();
  },

  getTeacherById(id: string) {
    return storageService.getTeachers().find(t => t.userId === id);
  },

  rankTeachers(subject?: string, grade?: string, query?: string) {
    const list = storageService.getTeachers();
    return [...list].sort((a, b) => {
      // Multidimensional ranking consideration: verified status, rating, number of ratings
      const scoreA = (a.verified ? 0.2 : 0) + a.rating * 0.7 + Math.min(a.ratingCount / 1000, 0.1);
      const scoreB = (b.verified ? 0.2 : 0) + b.rating * 0.7 + Math.min(b.ratingCount / 1000, 0.1);
      return scoreB - scoreA;
    }).filter(t => {
      if (subject && !t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))) return false;
      if (grade && !t.grades.some(g => g.toLowerCase().includes(grade.toLowerCase()))) return false;
      if (query) {
        const q = query.toLowerCase();
        return t.name.toLowerCase().includes(q) || (t.nameAr && t.nameAr.includes(q)) || t.subjects.some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  },

  rateTeacher(teacherId: string, rating: number, comment?: string) {
    return storageService.updateTeacherRating(teacherId, rating);
  }
};

export const homeworkService = {
  getHomework() {
    return storageService.getHomework();
  },

  createHomework(hw: Homework) {
    storageService.addHomework(hw);
    auditService.log({
      actorId: hw.teacherId,
      actorName: 'Teacher',
      actorRole: 'Teacher',
      action: 'PUBLISH_HOMEWORK',
      resource: hw.title,
      timestamp: new Date().toISOString(),
      details: `Published homework with ${hw.questionsCount} questions`
    });
  }
};

export const examService = {
  getExams() {
    return storageService.getExams();
  }
};

export const financeService = {
  getFinancialSummary(centerId: string) {
    const expenses = storageService.getExpenses().filter(e => e.centerId === centerId);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountEgp, 0);

    const enrollments = storageService.getEnrollments();
    const paidEnrollments = enrollments.filter(e => e.paymentStatus === 'PAID');
    const totalRevenue = paidEnrollments.reduce((sum, e) => sum + (e.paidAmount || 200), 0) + 185000; // include month baseline

    const settlements = storageService.getSettlements().filter(s => s.centerId === centerId);
    const totalTeacherLiabilities = settlements.reduce((sum, s) => sum + s.teacherShareEgp, 0);

    const payroll = storageService.getPayroll().filter(p => p.centerId === centerId);
    const totalPayroll = payroll.reduce((sum, p) => sum + p.netPayEgp, 0);

    const netProfit = totalRevenue - totalTeacherLiabilities - totalPayroll - totalExpenses;

    return {
      totalRevenue,
      totalTeacherLiabilities,
      totalPayroll,
      totalExpenses,
      netProfit,
      expensesList: expenses,
      settlementsList: settlements,
      payrollList: payroll
    };
  }
};

export const aiService = {
  async digitizePaperExam(fileOrText: string): Promise<{
    title: string;
    detectedQuestionsCount: number;
    questions: {
      id: string;
      type: 'mcq' | 'true_false' | 'short_answer';
      prompt: string;
      choices?: string[];
      correctAnswer: string;
      points: number;
    }[];
  }> {
    // Simulate AI scanning and extraction of questions with real physics/math structure
    await new Promise(r => setTimeout(r, 1200));

    return {
      title: 'Digitized Physics Worksheet — Newton Mechanics & Friction',
      detectedQuestionsCount: 4,
      questions: [
        {
          id: 'ai_q1',
          type: 'mcq',
          prompt: 'A box of mass 10 kg sits on a rough horizontal surface with friction coefficient mu = 0.3. The minimum force required to initiate motion is:',
          choices: ['29.4 N', '98.0 N', '30.0 N', '15.2 N'],
          correctAnswer: '29.4 N',
          points: 3
        },
        {
          id: 'ai_q2',
          type: 'true_false',
          prompt: 'Static friction force always adjusts to equal the applied horizontal force up to its limiting value.',
          choices: ['True', 'False'],
          correctAnswer: 'True',
          points: 2
        },
        {
          id: 'ai_q3',
          type: 'mcq',
          prompt: 'Which of the following physical quantities has the SI dimension [M L T^-2]?',
          choices: ['Energy', 'Force', 'Power', 'Momentum'],
          correctAnswer: 'Force',
          points: 2
        },
        {
          id: 'ai_q4',
          type: 'short_answer',
          prompt: 'Explain briefly why friction is classified as a non-conservative force.',
          correctAnswer: 'Work done by friction depends on the path taken and dissipates mechanical energy as thermal heat.',
          points: 3
        }
      ]
    };
  },

  async generateQuestions(subject: string, grade: string, topic: string, count: number, difficulty: string) {
    await new Promise(r => setTimeout(r, 1000));
    return [
      {
        id: `gen_q1`,
        type: 'mcq',
        prompt: `In ${topic} (${grade}), when potential energy reaches maximum, the kinetic energy is:`,
        choices: ['Zero', 'Maximum', 'Half of maximum', 'Negative'],
        correctAnswer: 'Zero',
        points: 2
      },
      {
        id: `gen_q2`,
        type: 'mcq',
        prompt: `Under ${difficulty} difficulty testing in ${subject}, calculating work done along a closed loop under conservative forces yields:`,
        choices: ['0 Joules', 'Positive work', 'Negative work', 'Infinity'],
        correctAnswer: '0 Joules',
        points: 3
      },
      {
        id: `gen_q3`,
        type: 'true_false',
        prompt: `Mechanical resonance occurs when driving frequency matches natural oscillation frequency.`,
        choices: ['True', 'False'],
        correctAnswer: 'True',
        points: 2
      }
    ];
  }
};

export const auditService = {
  getLogs(): AuditLog[] {
    const val = localStorage.getItem('kayedu_audit_logs');
    if (val) {
      try { return JSON.parse(val); } catch {}
    }
    return [
      {
        id: 'aud_1',
        centerId: 'center_kayedu',
        actorId: 'reception',
        actorName: 'Nouran Samir',
        actorRole: 'Reception Staff',
        action: 'CONFIRM_ATTENDANCE',
        resource: 'Student Ahmed Mohamed',
        timestamp: '2026-09-08 17:52',
        details: 'QR attendance validated for Physics Session 4'
      },
      {
        id: 'aud_2',
        centerId: 'center_kayedu',
        actorId: 'user_owner_1',
        actorName: 'Eng. Mahmoud El-Kady',
        actorRole: 'Center Owner',
        action: 'APPROVE_PAYROLL',
        resource: 'August 2026 Payroll',
        timestamp: '2026-09-07 11:30',
        details: 'Approved payroll batch for 3 employees'
      }
    ];
  },

  log(entry: Omit<AuditLog, 'id'>) {
    const logs = this.getLogs();
    const newEntry: AuditLog = { ...entry, id: `aud_${Date.now()}` };
    localStorage.setItem('kayedu_audit_logs', JSON.stringify([newEntry, ...logs]));
  }
};
