'use server';

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

enum Relation {
  Father = 'Father',
  Mother = 'Mother',
  Guardian = 'Guardian',
  Other = 'Other',
}

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

const generatePassword = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export async function updateStudent(formData: FormData) {
  const studentId = formData.get('id') as string;

  // Log all received form data
  console.log('Received form data:', Array.from(formData.entries()));

  // Extract data from FormData
  const campus = formData.get('campus') as string;
  const intakeGroup = formData.get('intakeGroup') as string;
  const qualification = formData.get('qualification') as string;
  const admissionNumber = formData.get('admissionNumber') as string;
  const email = formData.get('email') as string;
  const profileData = {
    firstName: formData.get('firstName') as string,
    middleName: (formData.get('middleName') as string) || '',
    lastName: formData.get('lastName') as string,
    idNumber: formData.get('idNumber') as string,
    dateOfBirth: (formData.get('dateOfBirth') as string) || '',
    gender: formData.get('gender') as Gender,
    homeLanguage: (formData.get('homeLanguage') as string) || '',
    mobileNumber: formData.get('mobileNumber') as string,
    cityAndGuildNumber: (formData.get('cityAndGuildNumber') as string) || '',
    admissionDate: (formData.get('admissionDate') as string) || '',
    address: {
      street1: formData.get('street1') as string,
      street2: (formData.get('street2') as string) || '',
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      country: formData.get('country') as string,
      postalCode: formData.get('postalCode') as string,
    },
    postalAddress: {
      street1: formData.get('street1') as string,
      street2: (formData.get('street2') as string) || '',
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      country: formData.get('country') as string,
      postalCode: formData.get('postalCode') as string,
    },
  };

  // Extract and log guardians data
  const guardiansData: any[] = [];
  const guardianIndices: Set<number> = new Set();

  // Identify guardian indices
  for (const [key] of formData.entries()) {
    const match = key.match(/guardians\[(\d+)\]\./);
    if (match) {
      guardianIndices.add(parseInt(match[1], 10));
    }
  }

  // Create guardian objects from extracted data
  for (const index of guardianIndices) {
    const guardianId = formData.get(`guardians[${index}].id`) as string;
    const password = generatePassword(12);
    const hashedPassword = guardianId
      ? undefined
      : await bcrypt.hash(password, 10);

    const guardian = {
      id: guardianId || undefined, // If ID is empty, it's a new guardian
      firstName: formData.get(`guardians[${index}].firstName`) as string,
      lastName: formData.get(`guardians[${index}].lastName`) as string,
      email: formData.get(`guardians[${index}].email`) as string,
      mobileNumber: formData.get(`guardians[${index}].phoneNumber`) as string,
      relation: formData.get(`guardians[${index}].relation`) as Relation,
      password: hashedPassword,
    };

    // Ensure no duplicate guardians are pushed
    if (
      !guardiansData.some(
        (g) =>
          g.firstName === guardian.firstName && g.lastName === guardian.lastName
      )
    ) {
      guardiansData.push(guardian);
    }
  }

  // Log extracted guardians data
  console.log('Extracted guardians data:', guardiansData);

  try {
    // Update or create guardians
    const updatedGuardians = await Promise.all(
      guardiansData.map(async (guardian) => {
        if (guardian.id) {
          // Update existing guardian
          const { id, ...updateData } = guardian;
          console.log('Updating guardian:', id, updateData);
          return prisma.guardian.update({
            where: { id },
            data: updateData,
          });
        } else {
          // Create new guardian
          console.log('Creating new guardian:', guardian);
          const newGuardian = await prisma.guardian.create({
            data: guardian,
          });
          console.log('New guardian created:', newGuardian);
          return newGuardian;
        }
      })
    );

    const guardianIds = updatedGuardians.map((guardian) => guardian.id);

    // Fetch existing student to preserve existing guardians
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { guardians: true },
    });

    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Combine existing and new guardian IDs, removing duplicates
    const allGuardianIds = Array.from(
      new Set([...existingStudent.guardians, ...guardianIds])
    );

    // Update student data
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        admissionNumber,
        email,
        campus: campus ? [campus] : [],
        intakeGroup: intakeGroup ? [intakeGroup] : [],
        qualification: qualification ? [qualification] : [],
        guardians: allGuardianIds,
        profile: {
          update: profileData,
        },
      },
    });

    console.log('Student updated:', student);
    return student;
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error('Failed to update student');
  }
}
