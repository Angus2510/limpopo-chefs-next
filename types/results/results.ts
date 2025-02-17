export interface ResultsResults {
  id: string;
  average: number | null;
  overallOutcome: string;
  score: number | null;
  student: string;
  taskScore: number | null;
  testScore: number | null;
}

export interface Result {
  id: string;
  title: string;
  conductedOn: Date;
  details: string;
  resultType: string;
  results: ResultsResults[];
}

export interface ProcessedResult {
  assignment: string;
  dateTaken: Date;
  scores: number;
  status: string;
  details: string;
  type: string;
  taskScore: number;
  testScore: number;
  average: number;
}
