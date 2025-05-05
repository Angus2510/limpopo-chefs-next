export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  mark: number;
  correctAnswer: string | string[] | { columnA: string; columnB: string }[];
  options?: QuestionOption[];
}

export interface QuestionState {
  id: string;
  isFlagged: boolean;
  isAnswered: boolean;
  answer?: string | { [key: string]: string };
}

export type QuestionType =
  | "multiple-choice"
  | "short-answer"
  | "long-answer"
  | "true-false"
  | "matching";

export interface QuestionOption {
  id: string;
  value?: string;
  columnA?: string;
  columnB?: string;
}

export interface TestProgress {
  currentQuestionIndex: number;
  questionStates: QuestionState[];
  timeRemaining: number;
  isComplete: boolean;
}

export interface Answer {
  questionId: string;
  answer: string | { [key: string]: string };
  timeSpent?: number;
}

export interface TestSubmission {
  assignmentId: string;
  answers: Answer[];
  timeSpent: number;
  submittedAt: Date;
}

export interface AssignmentResult {
  id: string;
  student: string;
  assignment: string;
  status: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  v: number;
  campus: string[];
  questions: string[];
  createdAt: Date;
  outcome: string[];
  password: string;
  updatedAt: Date;
  availableFrom: Date;
  title: string;
  type: string;
  duration: number;
  intakeGroups: string[];
  retake?: boolean;
  maxAttempts?: number;
  AssignmentResults: AssignmentResult[];
}
