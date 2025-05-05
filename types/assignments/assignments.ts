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

export interface Assignment {
  id: string;
  title: string;
  lecturer: string;
  type: "test" | "task";
  duration: number;
  availableFrom: Date;
  availableUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  campus: string[];
  intakeGroups: string[];
  outcome: string[];
  questions: Question[];
  individualStudents: string[];
  password: string;
  v: number;
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
