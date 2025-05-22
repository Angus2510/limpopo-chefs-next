"use server";

import prisma from "@/lib/db";
import { type GetPayableSchema } from "@/types/payable/payable";
import { getAllCampuses } from "../campus/campuses";

export const getPayableData = async (input: GetPayableSchema) => {
  const {
    page = 1,
    per_page = 10,
    sort = "admissionNumber.asc",
    search,
    campusTitles,
  } = input;

  const offset = (page - 1) * per_page;
  const [sortColumn, sortOrder] = sort.split(".") as [string, "asc" | "desc"];

  // Base query conditions
  const whereConditions: any = {};

  // Split search query into terms and search across multiple fields
  if (search) {
    const searchTerms = search.split(" ");
    whereConditions.AND = searchTerms.map((term) => ({
      OR: [
        { admissionNumber: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        {
          profile: {
            is: {
              firstName: { contains: term, mode: "insensitive" },
            },
          },
        },
        {
          profile: {
            is: {
              lastName: { contains: term, mode: "insensitive" },
            },
          },
        },
      ],
    }));
  }

  // Add campus filter
  if (campusTitles && campusTitles.length > 0) {
    whereConditions.campus = {
      hasSome: campusTitles,
    };
  }

  try {
    // Get students first
    const students = await prisma.students.findMany({
      where: whereConditions,
      select: {
        id: true,
        admissionNumber: true,
        email: true,
        profile: true,
        campus: true,
        inactiveReason: true,
      },
      skip: offset,
      take: per_page,
      orderBy: {
        [sortColumn]: sortOrder,
      },
    });

    const totalCount = await prisma.students.count({
      where: whereConditions,
    });

    // Get campus data
    const campuses = await getAllCampuses();
    const campusMap = new Map(
      campuses.map((campus) => [campus.id, campus.title])
    );

    // Process students with finances
    const studentsWithFinances = await Promise.all(
      students.map(async (student) => {
        try {
          // Get ONLY payableFees for each student
          const finance = await prisma.finances.findFirst({
            where: {
              student: student.id,
            },
            select: {
              payableFees: true, // Only select payableFees
            },
          });

          // Calculate financial data
          const payableFees = finance?.payableFees || [];

          // Calculate total payable from payableFees only
          const totalPayable = payableFees.reduce((sum, fee) => {
            const amount =
              typeof fee.amount === "number"
                ? fee.amount
                : parseFloat(fee.amount.toString() || "0");
            return sum + amount;
          }, 0);

          // Get overdue dates
          const now = new Date();
          const overdueFees = payableFees.filter((fee) => {
            return fee.dueDate && new Date(fee.dueDate) < now;
          });

          const dueDates = overdueFees
            .map((fee) => fee.dueDate)
            .filter(Boolean)
            .sort((a, b) => a!.getTime() - b!.getTime());

          const campusList = student.campus.map(
            (campusId) => campusMap.get(campusId) || "Unknown Campus"
          );

          return {
            id: student.id,
            admissionNumber: student.admissionNumber,
            firstName: student.profile?.firstName || "",
            lastName: student.profile?.lastName || "",
            email: student.email,
            campuses: campusList.join(", "),
            profileBlocked: student.inactiveReason ? "Yes" : "No",
            payableAmounts: totalPayable.toString(), // Direct amount from payableFees
            payableDueDates: dueDates[0] ? dueDates[0].toISOString() : "",
            hasOverduePayments: dueDates.length > 0,
          };
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed records and sort
    const validStudents = studentsWithFinances.filter(Boolean);
    const sortedStudents = validStudents.sort((a, b) => {
      if (a.hasOverduePayments && !b.hasOverduePayments) return -1;
      if (!a.hasOverduePayments && b.hasOverduePayments) return 1;

      const amountA = parseFloat(a.payableAmounts) || 0;
      const amountB = parseFloat(b.payableAmounts) || 0;
      if (amountA !== amountB) return amountB - amountA;

      return a.admissionNumber.localeCompare(b.admissionNumber);
    });

    return {
      students: sortedStudents,
      pageCount: Math.ceil(totalCount / per_page),
    };
  } catch (error) {
    console.error("Error in getPayableData:", error);
    return {
      students: [],
      pageCount: 0,
    };
  }
};
