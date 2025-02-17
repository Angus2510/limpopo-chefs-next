export interface TokenPayload {
  id: string;
  email: string;
  userType: string;
  exp: number;
}

export interface StudentData {
  student: {
    id: string;
    admissionNumber: string;
    email: string;
    avatarUrl?: string;
    profile: {
      firstName: string;
      lastName: string;
      idNumber: string;
    };
    inactiveReason?: string;
    campus: string;
    intakeGroup: string[];
  };
  wellnessRecords: ProcessedWelRecord[];
  results: ProcessedResult[];
  learningMaterials: any[];
  events: any[];
  finances: ProcessedFinances | null;
  documents: any[];
}
export interface StudentProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: Date;
  idNumber: string;
  mobileNumber?: string;
  gender?: string;
  homeLanguage?: string;
  cityAndGuildNumber?: string;
  admissionDate?: Date;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface Student {
  id: string;
  admissionNumber: string;
  email: string;
  avatarUrl?: string;
  profile: StudentProfile;
  inactiveReason?: string;
  campus: string[];
  intakeGroup: string[];
  qualification?: string[];
  accommodation?: string;
}

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  relation: string;
}

export interface IntakeGroup {
  id: string;
  title: string;
}

export interface Campus {
  id: string;
  title: string;
}

export interface Qualification {
  id: string;
  title: string;
}

export interface Accommodation {
  id: string;
  roomNumber: string;
  roomType: string;
  costPerBed: number;
  title: string;
}
