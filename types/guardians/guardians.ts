export interface Guardian {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  relation: string;
  userType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  admissionNumber: string;
  email: string;
  avatarUrl?: string;
  profile: {
    firstName: string;
    lastName: string;
    idNumber: string;
  };
  guardians?: Guardian[];
  inactiveReason?: string;
  campus: string[];
  intakeGroup: string[];
}
