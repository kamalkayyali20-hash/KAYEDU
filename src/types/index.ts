export type Role = 'student' | 'teacher' | 'parent' | 'center_owner' | 'center_staff' | 'super_admin';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl: string;
  centerIds?: string[]; // Centers this user is associated with
  primaryCenterId?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  studentCode: string;
  grade: string;
  educationSystem: 'Thanaweya Amma' | 'IGCSE' | 'American Diploma' | 'National Arabic';
  parentUserId?: string;
  schoolName?: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  overallStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk';
  statusReasons: string[];
}

export interface TeacherProfile {
  userId: string;
  title: string;
  subjects: string[];
  grades: string[];
  rating: number;
  ratingCount: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  experienceYears: number;
  centerIds: string[];
  bio: string;
  bioAr?: string;
  verified: boolean;
  onlineAvailable: boolean;
}

export interface Center {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  branches: { id: string; name: string; nameAr: string }[];
  onlinePaymentsEnabled: boolean;
  paymentMethods: ('card' | 'wallet' | 'cash')[];
  subscriptionStatus: 'pilot' | 'trial' | 'active' | 'past_due' | 'suspended';
  subscriptionPlan: string;
  isFoundingCenter?: boolean;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'WAITLISTED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Session {
  id: string;
  centerId: string;
  centerName: string;
  centerNameAr?: string;
  branchName: string;
  teacherId: string;
  teacherName: string;
  teacherNameAr?: string;
  teacherAvatar: string;
  subject: string;
  subjectAr?: string;
  grade: string;
  groupName: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priceEgp: number;
  isOnline: boolean;
  onlineMeetingUrl?: string;
  capacity: number;
  enrolledCount: number;
  status: SessionStatus;
}

export interface StudentSessionEnrollment {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentAvatar: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'online_card' | 'digital_wallet' | 'center_cash';
  paidAmount?: number;
  paidAt?: string;
  receiptNumber?: string;
  attendanceStatus?: AttendanceStatus;
  attendanceTime?: string;
  reservationStatus: ReservationStatus;
  waitingListPosition?: number;
}

export interface QRTokenPayload {
  token: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentAvatar: string;
  sessionId: string;
  sessionTitle: string;
  centerId: string;
  centerName: string;
  room: string;
  priceEgp: number;
  paymentStatus: PaymentStatus;
  expiresAt: number; // epoch ms
  nonce: string;
  status: 'valid' | 'used' | 'expired';
}

export interface Homework {
  id: string;
  sessionId?: string;
  teacherId: string;
  teacherName?: string;
  centerId: string;
  subject: string;
  grade: string;
  title: string;
  titleAr?: string;
  instructions: string;
  dueDate: string;
  assignedDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questionsCount: number;
  questions?: HomeworkQuestion[];
  attachments?: { name: string; url: string; size: string }[];
}

export interface HomeworkQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
  prompt: string;
  choices?: string[];
  correctAnswer?: string | number;
  points: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
  score?: number;
  maxScore: number;
  teacherFeedback?: string;
}

export interface Exam {
  id: string;
  centerId: string;
  teacherId: string;
  subject: string;
  grade: string;
  title: string;
  durationMinutes: number;
  date: string;
  startTime: string;
  totalPoints: number;
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'GRADED' | 'RESULTS_RELEASED';
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
  prompt: string;
  choices?: string[];
  correctAnswer?: string | number;
  points: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
  completedAt: string;
  feedback?: string;
  status: 'completed' | 'in_progress';
}

export interface MaterialItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
  type: 'pdf' | 'worksheet' | 'video' | 'link';
  fileSize?: string;
  url: string;
  date: string;
}

export interface TeacherSettlement {
  id: string;
  centerId: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  period: string;
  sessionsCount: number;
  attendedStudentsCount: number;
  totalRevenueEgp: number;
  calculationRule: 'percentage_80' | 'percentage_75' | 'per_student_150' | 'custom';
  teacherShareEgp: number;
  centerShareEgp: number;
  adjustmentsEgp: number;
  paidAmountEgp: number;
  status: 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PAID';
  approvedBy?: string;
  paidAt?: string;
}

export interface Employee {
  id: string;
  centerId: string;
  name: string;
  nameAr?: string;
  phone: string;
  role: 'Receptionist' | 'Accountant' | 'Operations Manager' | 'Floor Supervisor';
  branchName: string;
  status: 'active' | 'leave' | 'inactive';
  compensationModel: 'FIXED_SALARY' | 'SESSION_PERCENTAGE' | 'FIXED_PER_SESSION' | 'HYBRID';
  baseSalaryEgp: number;
  perSessionRateEgp?: number;
  sessionPercentage?: number;
  eligibleSessionsThisMonth: number;
  startDate: string;
}

export interface PayrollRecord {
  id: string;
  centerId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  period: string; // YYYY-MM
  baseSalaryEgp: number;
  sessionEarningsEgp: number;
  bonusEgp: number;
  overtimeEgp: number;
  deductionsEgp: number;
  netPayEgp: number;
  status: 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PAID';
  paidAt?: string;
}

export interface ExpenseRecord {
  id: string;
  centerId: string;
  category: 'Rent' | 'Electricity' | 'Internet' | 'Salaries' | 'Marketing' | 'Maintenance' | 'Supplies' | 'Other';
  amountEgp: number;
  date: string;
  branch: string;
  description: string;
  paymentMethod: string;
  createdBy: string;
}

export interface TeacherRatingReview {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedAttendance: boolean;
}

export interface TeacherNote {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  type: 'Academic' | 'Engagement' | 'Recommendation' | 'Follow-up';
  visibility: 'teacher_only' | 'center_management' | 'parent_and_student' | 'parent_only';
  content: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'class_reminder' | 'schedule_changed' | 'payment_due' | 'payment_success' | 'attendance' | 'homework' | 'exam' | 'note' | 'settlement';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  centerId?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
}
