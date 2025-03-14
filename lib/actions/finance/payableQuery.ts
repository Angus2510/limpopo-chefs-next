"use server";

import prisma from "@/lib/db";
import { type GetPayableSchema } from "@/types/payable/payable";

export const getPayableData = async (input: GetPayableSchema) => {
  const {
    page = 1,
    per_page = 10,
    sort = "admissionNumber.asc",
    search,
    email,
    campusTitles,
    intakeGroupTitles,
  } = input;

  const offset = (page - 1) * per_page;
  const [sortColumn, sortOrder] = sort.split(".") as [string, "asc" | "desc"];

  if (!sortColumn || !sortOrder) {
    throw new Error("Invalid sort parameter");
  }

  if (["campuses", "intakeGroups"].includes(sortColumn)) {
    throw new Error("Invalid sort parameter");
  }

  const whereConditions: any = {};

  if (search) {
    whereConditions.OR = [
      {
        admissionNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        profile: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      },
      {
        campus: {
          hasSome: [search],
        },
      },
    ];
  }

  if (email) {
    whereConditions.email = {
      contains: email,
      mode: "insensitive",
    };
  }

  // Initialize maps for campus and intake group lookups
  const campusMap: { [key: string]: string } = {};
  const intakeGroupMap: { [key: string]: string } = {};

  // Handle campus filtering
  let campusIds: string[] = [];
  if (campusTitles && campusTitles.length > 0) {
    const campuses = await prisma.campus.findMany({
      where: { title: { in: campusTitles } },
      select: { id: true, title: true },
    });
    campusIds = campuses.map((campus) => campus.id);
    campuses.forEach((campus) => {
      campusMap[campus.id] = campus.title;
    });
  }

  // Handle intake group filtering
  let intakeGroupIds: string[] = [];
  if (intakeGroupTitles && intakeGroupTitles.length > 0) {
    const intakeGroups = await prisma.intakegroups.findMany({
      where: { title: { in: intakeGroupTitles } },
      select: { id: true, title: true },
    });
    intakeGroupIds = intakeGroups.map((group) => group.id);
    intakeGroups.forEach((group) => {
      intakeGroupMap[group.id] = group.title;
    });
  }

  // Apply filters
  if (campusIds.length > 0) {
    whereConditions.campus = { hasSome: campusIds };
  }

  if (intakeGroupIds.length > 0) {
    whereConditions.intakeGroup = { hasSome: intakeGroupIds };
  }

  // Handle sorting
  const orderByCondition =
    sortColumn === "firstName" || sortColumn === "lastName"
      ? { profile: { [sortColumn]: sortOrder } }
      : { [sortColumn]: sortOrder };

  // Fetch students with all necessary data
  const data = await prisma.students.findMany({
    where: whereConditions,
    select: {
      id: true,
      admissionNumber: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          idNumber: true,
          admissionDate: true,
          cityAndGuildNumber: true,
        },
      },
      inactiveReason: true,
      campus: true,
      intakeGroup: true,
    },
    skip: offset,
    take: per_page,
    orderBy: orderByCondition,
  });

  const totalStudents = await prisma.students.count({
    where: whereConditions,
  });

  // Fetch financial data for all students
  const studentIds = data.map((student) => student.id);
  const finances = await prisma.finances.findMany({
    where: { student: { in: studentIds } },
    select: {
      student: true,
      payableFees: {
        select: {
          amount: true,
          dueDate: true,
        },
      },
    },
  });

  // Create a map of financial data
  const financeMap = finances.reduce((acc: any, finance) => {
    acc[finance.student] = finance.payableFees;
    return acc;
  }, {});

  // Calculate page count
  const pageCount = Math.ceil(totalStudents / per_page);

  // Get all unique campus and intake group IDs
  const allCampusIds = new Set<string>();
  const allIntakeGroupIds = new Set<string>();
  data.forEach((student) => {
    student.campus.forEach((id) => allCampusIds.add(id));
    student.intakeGroup.forEach((id) => allIntakeGroupIds.add(id));
  });

  // Fetch all campus titles
  const campuses = await prisma.campus.findMany({
    where: { id: { in: Array.from(allCampusIds) } },
    select: { id: true, title: true },
  });
  campuses.forEach((campus) => {
    campusMap[campus.id] = campus.title;
  });

  // Fetch all intake group titles
  const intakeGroups = await prisma.intakegroups.findMany({
    where: { id: { in: Array.from(allIntakeGroupIds) } },
    select: { id: true, title: true },
  });
  intakeGroups.forEach((group) => {
    intakeGroupMap[group.id] = group.title;
  });

  // Transform and return the data
  const students = data.map((student) => {
    const payableFees = financeMap[student.id] || [];
    const payableAmounts = payableFees.map((fee) => fee.amount).join(", ");
    const payableDueDates = payableFees
      .map((fee) => new Date(fee.dueDate).toLocaleDateString("en-GB"))
      .join(", ");

    return {
      id: student.id,
      admissionNumber: student.admissionNumber,
      email: student.email || "",
      firstName: student.profile?.firstName || "N/A",
      lastName: student.profile?.lastName || "N/A",
      idNumber: student.profile?.idNumber || "N/A",
      admissionDate: student.profile?.admissionDate
        ? new Date(student.profile.admissionDate).toLocaleDateString("en-GB")
        : "N/A",
      cityAndGuildNumber: student.profile?.cityAndGuildNumber || "N/A",
      profileBlocked: student.inactiveReason ? "Yes" : "No",
      campuses: student.campus.map((id) => campusMap[id] || id).join(", "),
      intakeGroups: student.intakeGroup
        .map((id) => intakeGroupMap[id] || id)
        .join(", "),
      payableAmounts,
      payableDueDates,
    };
  });

  return { students, pageCount };
};
