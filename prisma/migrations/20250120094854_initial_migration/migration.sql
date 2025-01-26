-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('Theory', 'Practical', 'Exams_Well');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "CurrentResult" AS ENUM ('Pass', 'Fail');

-- CreateEnum
CREATE TYPE "Relation" AS ENUM ('Father', 'Mother', 'Guardian', 'Other');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Staff', 'Student', 'Guardian');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FULL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "AllowedAction" AS ENUM ('CHANGE_PASSWORD', 'ACCEPT_AGREEMENT', 'VIEW_INACTIVE_REASON');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LEGAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('Competent', 'Not_Yet_Competent');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('Test', 'Task');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SingleWord', 'ShortAnswer', 'MultipleChoice', 'TrueFalse', 'Matching');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PendingMarking', 'Marked', 'Moderated', 'Terminated', 'Writing');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('One_Day', 'Custom_Time');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('P', 'A', 'H', 'AR', 'WEL', 'N');

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeGroup" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "IntakeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeGroupOutcome" (
    "intakeGroupId" INTEGER NOT NULL,
    "outcomeId" INTEGER NOT NULL,

    CONSTRAINT "IntakeGroupOutcome_pkey" PRIMARY KEY ("intakeGroupId","outcomeId")
);

-- CreateTable
CREATE TABLE "IntakeGroupCampus" (
    "intakeGroupId" INTEGER NOT NULL,
    "campusId" INTEGER NOT NULL,

    CONSTRAINT "IntakeGroupCampus_pkey" PRIMARY KEY ("intakeGroupId","campusId")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "OutcomeType" NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" SERIAL NOT NULL,
    "degree" VARCHAR(100) NOT NULL,
    "institution" VARCHAR(100) NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionGroup" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionTemplate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "groupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" "UserType" NOT NULL,
    "roles" VARCHAR(50)[],
    "permissions" VARCHAR(50)[],
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'FULL',
    "allowedActions" "AllowedAction"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "userAgent" VARCHAR(255),
    "deviceType" VARCHAR(50),
    "ipAddress" VARCHAR(50),
    "osType" VARCHAR(50),
    "osVersion" VARCHAR(50),
    "resetToken" VARCHAR(255),
    "resetTokenExpiry" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprint" VARCHAR(255),
    "geoLocation" VARCHAR(255),
    "metadata" JSONB,
    "loginMethod" VARCHAR(50),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffPermission" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "StaffPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50),
    "email" VARCHAR(255),
    "password" TEXT,
    "agreementAccepted" BOOLEAN DEFAULT false,
    "agreementAcceptedDate" TIMESTAMP(3),
    "resetToken" VARCHAR(255),
    "resetTokenExpiry" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" VARCHAR(255),
    "profileId" INTEGER,
    "active" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50),
    "middleName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "employeeId" VARCHAR(50),
    "idNumber" VARCHAR(50),
    "passportNumber" VARCHAR(50),
    "dateOfBirth" TIMESTAMP(3),
    "qualification" VARCHAR(100)[],
    "workExperience" VARCHAR(100)[],
    "gender" VARCHAR(20),
    "designation" VARCHAR(50),
    "maritalStatus" VARCHAR(50),
    "avatar" VARCHAR(255),
    "mobileNumber" VARCHAR(20),
    "emergencyContact" VARCHAR(50),
    "addressId" INTEGER,
    "postalAddressId" INTEGER,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "admissionNumber" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "agreementAcceptedDate" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "alumni" BOOLEAN NOT NULL DEFAULT false,
    "currentResult" "CurrentResult",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inactiveReason" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'Student',
    "profileId" INTEGER,
    "campusId" INTEGER,
    "intakeGroupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50),
    "middleName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "idNumber" VARCHAR(50),
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "homeLanguage" VARCHAR(50),
    "avatar" VARCHAR(500),
    "mobileNumber" VARCHAR(50),
    "cityAndGuildNumber" VARCHAR(50),
    "admissionDate" TIMESTAMP(3),
    "importantInformation" VARCHAR(1000),
    "homeAddressId" INTEGER,
    "postalAddressId" INTEGER,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "street1" VARCHAR(150),
    "street2" VARCHAR(150),
    "city" VARCHAR(50),
    "province" VARCHAR(50),
    "country" VARCHAR(50),
    "postalCode" VARCHAR(20),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "email" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "mobileNumber" VARCHAR(20),
    "relation" "Relation" NOT NULL DEFAULT 'Other',
    "resetToken" VARCHAR(255),
    "resetTokenExpiry" TIMESTAMP(3),
    "refreshToken" VARCHAR(255),
    "userType" VARCHAR(50) NOT NULL DEFAULT 'Guardian',

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "documentURL" VARCHAR(255) NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentType" "DocumentType" NOT NULL,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WELRecord" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "establishmentName" VARCHAR(100) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalHours" INTEGER NOT NULL,
    "contractAgreement" VARCHAR(255),
    "evaluated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WELRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "outcomeId" INTEGER NOT NULL,
    "testScore" DOUBLE PRECISION,
    "taskScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "outcomeStatus" "OutcomeStatus" NOT NULL,
    "observer" VARCHAR(100) NOT NULL,
    "dateCaptured" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEdited" TIMESTAMP(3),

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "outcomeId" INTEGER NOT NULL,
    "type" "AssignmentType" NOT NULL,
    "password" VARCHAR(5) NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableUntil" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "questionText" VARCHAR(500) NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT,
    "mark" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAssignment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "lecturerId" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedAt" TIMESTAMP(3),
    "moderatedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "totalScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "status" "AssignmentStatus" NOT NULL,
    "feedback" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswer" (
    "id" SERIAL NOT NULL,
    "studentAssignmentId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answer" TEXT,
    "correct" BOOLEAN,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderation" (
    "id" SERIAL NOT NULL,
    "studentAssignmentId" INTEGER NOT NULL,
    "moderatorId" INTEGER,
    "newTotalScore" DOUBLE PRECISION NOT NULL,
    "newPercentage" DOUBLE PRECISION NOT NULL,
    "result" "OutcomeStatus" NOT NULL,
    "moderatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionModeration" (
    "id" SERIAL NOT NULL,
    "moderationId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "newMark" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "type" "AttendanceType" NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "comments" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelAttendance" (
    "id" SERIAL NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelAttendanceIntakeGroup" (
    "welAttendanceId" INTEGER NOT NULL,
    "intakeGroupId" INTEGER NOT NULL,

    CONSTRAINT "WelAttendanceIntakeGroup_pkey" PRIMARY KEY ("welAttendanceId","intakeGroupId")
);

-- CreateTable
CREATE TABLE "WelAttendanceCampus" (
    "welAttendanceId" INTEGER NOT NULL,
    "campusId" INTEGER NOT NULL,

    CONSTRAINT "WelAttendanceCampus_pkey" PRIMARY KEY ("welAttendanceId","campusId")
);

-- CreateTable
CREATE TABLE "WelDetail" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "dateUploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(1000),
    "accommodation" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "notes" VARCHAR(1000),
    "photoLinks" VARCHAR(255)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodeCampus" (
    "qrCodeId" INTEGER NOT NULL,
    "campusId" INTEGER NOT NULL,

    CONSTRAINT "QRCodeCampus_pkey" PRIMARY KEY ("qrCodeId","campusId")
);

-- CreateTable
CREATE TABLE "QRCodeIntakeGroup" (
    "qrCodeId" INTEGER NOT NULL,
    "intakeGroupId" INTEGER NOT NULL,

    CONSTRAINT "QRCodeIntakeGroup_pkey" PRIMARY KEY ("qrCodeId","intakeGroupId")
);

-- CreateTable
CREATE TABLE "_StudentQualifications" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentQualifications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_StudentGuardians" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentGuardians_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssignmentIntakeGroups" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentIntakeGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssignmentCampuses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentCampuses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssignmentStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Campus_name_idx" ON "Campus"("name");

-- CreateIndex
CREATE INDEX "IntakeGroup_name_idx" ON "IntakeGroup"("name");

-- CreateIndex
CREATE INDEX "Outcome_name_idx" ON "Outcome"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionGroup_name_key" ON "PermissionGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ActionTemplate_name_key" ON "ActionTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ActionTemplate_slug_key" ON "ActionTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_staffId_roleId_key" ON "UserRole"("staffId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffPermission_staffId_permissionId_key" ON "StaffPermission"("staffId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_profileId_key" ON "Staff"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_profileId_key" ON "Student"("profileId");

-- CreateIndex
CREATE INDEX "Student_admissionNumber_idx" ON "Student"("admissionNumber");

-- CreateIndex
CREATE INDEX "Student_campusId_idx" ON "Student"("campusId");

-- CreateIndex
CREATE INDEX "Student_intakeGroupId_idx" ON "Student"("intakeGroupId");

-- CreateIndex
CREATE INDEX "Student_username_idx" ON "Student"("username");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "StudentProfile_firstName_idx" ON "StudentProfile"("firstName");

-- CreateIndex
CREATE INDEX "StudentProfile_lastName_idx" ON "StudentProfile"("lastName");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE INDEX "Guardian_email_idx" ON "Guardian"("email");

-- CreateIndex
CREATE INDEX "StudentDocument_studentId_idx" ON "StudentDocument"("studentId");

-- CreateIndex
CREATE INDEX "WELRecord_studentId_idx" ON "WELRecord"("studentId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_attendanceDate_idx" ON "Attendance"("studentId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_uuid_key" ON "QRCode"("uuid");

-- CreateIndex
CREATE INDEX "QRCode_uuid_idx" ON "QRCode"("uuid");

-- CreateIndex
CREATE INDEX "_StudentQualifications_B_index" ON "_StudentQualifications"("B");

-- CreateIndex
CREATE INDEX "_StudentGuardians_B_index" ON "_StudentGuardians"("B");

-- CreateIndex
CREATE INDEX "_AssignmentIntakeGroups_B_index" ON "_AssignmentIntakeGroups"("B");

-- CreateIndex
CREATE INDEX "_AssignmentCampuses_B_index" ON "_AssignmentCampuses"("B");

-- CreateIndex
CREATE INDEX "_AssignmentStudents_B_index" ON "_AssignmentStudents"("B");

-- AddForeignKey
ALTER TABLE "IntakeGroupOutcome" ADD CONSTRAINT "IntakeGroupOutcome_intakeGroupId_fkey" FOREIGN KEY ("intakeGroupId") REFERENCES "IntakeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeGroupOutcome" ADD CONSTRAINT "IntakeGroupOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeGroupCampus" ADD CONSTRAINT "IntakeGroupCampus_intakeGroupId_fkey" FOREIGN KEY ("intakeGroupId") REFERENCES "IntakeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeGroupCampus" ADD CONSTRAINT "IntakeGroupCampus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionTemplate" ADD CONSTRAINT "ActionTemplate_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PermissionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_postalAddressId_fkey" FOREIGN KEY ("postalAddressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_intakeGroupId_fkey" FOREIGN KEY ("intakeGroupId") REFERENCES "IntakeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_homeAddressId_fkey" FOREIGN KEY ("homeAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_postalAddressId_fkey" FOREIGN KEY ("postalAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WELRecord" ADD CONSTRAINT "WELRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_studentAssignmentId_fkey" FOREIGN KEY ("studentAssignmentId") REFERENCES "StudentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_studentAssignmentId_fkey" FOREIGN KEY ("studentAssignmentId") REFERENCES "StudentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionModeration" ADD CONSTRAINT "QuestionModeration_moderationId_fkey" FOREIGN KEY ("moderationId") REFERENCES "Moderation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionModeration" ADD CONSTRAINT "QuestionModeration_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelAttendanceIntakeGroup" ADD CONSTRAINT "WelAttendanceIntakeGroup_welAttendanceId_fkey" FOREIGN KEY ("welAttendanceId") REFERENCES "WelAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelAttendanceIntakeGroup" ADD CONSTRAINT "WelAttendanceIntakeGroup_intakeGroupId_fkey" FOREIGN KEY ("intakeGroupId") REFERENCES "IntakeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelAttendanceCampus" ADD CONSTRAINT "WelAttendanceCampus_welAttendanceId_fkey" FOREIGN KEY ("welAttendanceId") REFERENCES "WelAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelAttendanceCampus" ADD CONSTRAINT "WelAttendanceCampus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeCampus" ADD CONSTRAINT "QRCodeCampus_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeCampus" ADD CONSTRAINT "QRCodeCampus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeIntakeGroup" ADD CONSTRAINT "QRCodeIntakeGroup_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeIntakeGroup" ADD CONSTRAINT "QRCodeIntakeGroup_intakeGroupId_fkey" FOREIGN KEY ("intakeGroupId") REFERENCES "IntakeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentQualifications" ADD CONSTRAINT "_StudentQualifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Qualification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentQualifications" ADD CONSTRAINT "_StudentQualifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentGuardians" ADD CONSTRAINT "_StudentGuardians_A_fkey" FOREIGN KEY ("A") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentGuardians" ADD CONSTRAINT "_StudentGuardians_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentIntakeGroups" ADD CONSTRAINT "_AssignmentIntakeGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentIntakeGroups" ADD CONSTRAINT "_AssignmentIntakeGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "IntakeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentCampuses" ADD CONSTRAINT "_AssignmentCampuses_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentCampuses" ADD CONSTRAINT "_AssignmentCampuses_B_fkey" FOREIGN KEY ("B") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentStudents" ADD CONSTRAINT "_AssignmentStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentStudents" ADD CONSTRAINT "_AssignmentStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
