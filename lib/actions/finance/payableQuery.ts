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

  // Base query conditions - removed active filter to show all students
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
    // Fetch campuses first for mapping
    const campuses = await getAllCampuses();
    const campusMap = new Map(
      campuses.map((campus) => [campus.id, campus.title])
    );

    // Fetch all students
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

    // Get finances for these students
    const studentsWithFinances = await Promise.all(
      students.map(async (student) => {
        const finance = await prisma.finances.findFirst({
          where: {
            student: student.id,
          },
          select: {
            payableFees: true,
            collectedFees: true,
          },
        });

        // Calculate financial data
        const payableFees = finance?.payableFees || [];
        const collectedFees = finance?.collectedFees || [];

        // Calculate total payable
        const totalPayable = payableFees.reduce((sum, fee) => {
          const amount =
            typeof fee.amount === "number"
              ? fee.amount
              : parseFloat(fee.amount.toString() || "0");
          return sum + amount;
        }, 0);

        // Calculate total collected
        const totalCollected = collectedFees.reduce((sum, fee) => {
          const credit =
            typeof fee.credit === "number"
              ? fee.credit
              : parseFloat(fee.credit?.toString() || "0");
          const debit =
            typeof fee.debit === "number"
              ? fee.debit
              : parseFloat(fee.debit?.toString() || "0");
          return sum + credit - debit;
        }, 0);

        // Get overdue dates
        const now = new Date();
        const overdueFees = payableFees.filter((fee) => {
          return fee.dueDate && new Date(fee.dueDate) < now;
        });

        // Sort overdue dates
        const dueDates = overdueFees
          .map((fee) => fee.dueDate)
          .filter(Boolean)
          .sort((a, b) => a!.getTime() - b!.getTime());

        // Map campus IDs to titles
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
          payableAmounts: (totalPayable - totalCollected).toString(),
          payableDueDates: dueDates[0] ? dueDates[0].toISOString() : "",
          hasOverduePayments: dueDates.length > 0,
        };
      })
    );

    // Sort by overdue status and amount
    const sortedStudents = studentsWithFinances.sort((a, b) => {
      // First sort by overdue status
      if (a.hasOverduePayments && !b.hasOverduePayments) return -1;
      if (!a.hasOverduePayments && b.hasOverduePayments) return 1;

      // Then by amount due
      const amountA = parseFloat(a.payableAmounts) || 0;
      const amountB = parseFloat(b.payableAmounts) || 0;
      if (amountA !== amountB) return amountB - amountA;

      // Finally by admission number
      return a.admissionNumber.localeCompare(b.admissionNumber);
    });

    return {
      students: sortedStudents,
      pageCount: Math.ceil(totalCount / per_page),
    };
  } catch (error) {
    console.error("Error in getPayableData:", error);
    throw error;
  }
};
