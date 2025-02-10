// types/auth.ts
export type UserType = "Staff" | "Student" | "Guardian";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  avatar?: string;
  email: string;
}

export interface TokenPayload {
  id: string;
  userType: UserType;
  exp: number;
}

export interface StudentData {
  student: any; // Replace with your student type
  wellnessRecords: any[];
  results: any[];
  learningMaterials: any[];
  events: any[];
  finances: any;
  documents: any[];
}

export interface StaffData {
  staff: {
    department: string;
    role: string;
    specializations: string[];
    [key: string]: any;
  };
  assignedClasses: any[];
  schedule: any[];
  responsibilities: any[];
}

export interface GuardianData {
  guardian: {
    relationshipToStudents: string;
    [key: string]: any;
  };
  dependents: any[];
  payments: any[];
  communications: any[];
}

export type UserData = StudentData | StaffData | GuardianData;
