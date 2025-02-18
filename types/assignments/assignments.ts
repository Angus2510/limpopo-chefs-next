export interface Question {
  id?: string;
  text: string;
  type: QuestionType;
  mark: number;
  correctAnswer: string | string[] | { columnA: string; columnB: string }[];
  options?: QuestionOption[];
}

export type QuestionType =
  | "multiple-choice"
  | "short-answer"
  | "long-answer"
  | "true-false"
  | "matching";

export interface QuestionOption {
  id?: string;
  value?: string;
  columnA?: string;
  columnB?: string;
}

export interface Assignment {
  // Common required fields
  id: string;
  title: string;
  lecturer: string;

  // Type with union for stricter typing
  type: "test" | "task";

  // Duration can be either an object or number
  duration:
    | number
    | {
        hours: string;
        minutes: string;
      };

  // Dates
  availableFrom: Date;
  availableUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Array fields
  campus: string[];
  intakeGroups: string[];
  outcome: string[]; // Note: this was 'outcomes' in first interface
  questions: string[] | Question[]; // Support both string[] and Question[]
  individualStudents: string[];

  // Additional fields from second interface
  password: string;
  v: number;
}
