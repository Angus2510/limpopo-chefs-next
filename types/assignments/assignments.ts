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
  id?: string;
  title: string;
  type: "test" | "task";
  duration: {
    hours: string;
    minutes: string;
  };
  availableFrom: Date;
  availableUntil?: Date;
  campus: string[];
  intakeGroups: string[];
  outcomes: string[];
  questions: Question[];
  lecturer: string;
}
