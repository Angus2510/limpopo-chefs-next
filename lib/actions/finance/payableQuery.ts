"use server";

import prisma from "@/lib/db";
import { type GetPayableSchema } from "@/types/payable/payable";
import { cache } from "react";

// Cache the lookup data for 5 minutes
const CACHE_DURATION = 1000 * 60 * 5;

// Cache expensive lookups
const getCampusMap = cache(async () => {
  const campuses = await prisma.campus.findMany({
    select: { id: true, title: true },
  });
  return new Map(campuses.map((campus) => [campus.id, campus.title]));
});

const getIntakeGroupMap = cache(async () => {
  const intakeGroups = await prisma.intakegroups.findMany({
    select: { id: true, title: true },
  });
  return new Map(intakeGroups.map((group) => [group.id, group.title]));
});

export const getPayableData = async (input: GetPayableSchema) => {
  try {
    if (!input) {
      throw new Error("Invalid input parameters");
    }

    const {
      page = 1,
      per_page = 10,
      sort = "admissionNumber.asc",
      search,
      email,
      campusTitles,
      intakeGroupTitles,
      startDate,
      endDate,
      paymentStatus,
    } = input;

    const offset = (page - 1) * per_page;
    const [sortColumn, sortOrder] = sort.split(".") as [string, "asc" | "desc"];

    if (!sortColumn || !sortOrder) {
      throw new Error("Invalid sort parameter");
    }

    const whereConditions: any = {
      AND: [],
    };

    // Handle search conditions
    if (search) {
      whereConditions.AND.push({
        OR: [
          { admissionNumber: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          {
            profile: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { idNumber: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    // Handle date range filtering
    if (startDate || endDate) {
      whereConditions.AND.push({
        profile: {
          admissionDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      });
    }

    // Handle payment status filtering
    if (paymentStatus) {
      whereConditions.AND.push({
        finances: {
          some: {
            payableFees: {
              some: {
                status: paymentStatus,
              },
            },
          },
        },
      });
    }

    // Handle email filter
    if (email) {
      whereConditions.AND.push({
        email: { contains: email, mode: "insensitive" },
      });
    }

    // Get cached lookup data
    const [campusMap, intakeGroupMap] = await Promise.all([
      getCampusMap(),
      getIntakeGroupMap(),
    ]);

    // Handle campus and intake group filtering
    if (campusTitles?.length) {
      const campusIds = Array.from(campusMap.entries())
        .filter(([_, title]) => campusTitles.includes(title))
        .map(([id]) => id);
      if (campusIds.length) {
        whereConditions.AND.push({ campus: { hasSome: campusIds } });
      }
    }

    if (intakeGroupTitles?.length) {
      const groupIds = Array.from(intakeGroupMap.entries())
        .filter(([_, title]) => intakeGroupTitles.includes(title))
        .map(([id]) => id);
      if (groupIds.length) {
        whereConditions.AND.push({ intakeGroup: { hasSome: groupIds } });
      }
    }

    // Handle sorting with profile fields
    const orderByCondition =
      sortColumn === "firstName" || sortColumn === "lastName"
        ? { profile: { [sortColumn]: sortOrder } }
        : { [sortColumn]: sortOrder };

    // Fetch students and total count in parallel
    const [students, totalCount] = await Promise.all([
      prisma.students.findMany({
        where: whereConditions.AND.length ? whereConditions : {},
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
              contactNumber: true,
            },
          },
          inactiveReason: true,
          campus: true,
          intakeGroup: true,
          finances: {
            select: {
              payableFees: {
                select: {
                  amount: true,
                  dueDate: true,
                  status: true,
                  description: true,
                },
              },
              collectedFees: {
                select: {
                  amount: true,
                  date: true,
                  description: true,
                },
              },
            },
          },
        },
        skip: offset,
        take: per_page,
        orderBy: orderByCondition,
      }),
      prisma.students.count({
        where: whereConditions.AND.length ? whereConditions : {},
      }),
    ]);

    // Transform student data
    const transformedStudents = students.map((student) => {
      const payableFees = student.finances?.payableFees || [];
      const collectedFees = student.finances?.collectedFees || [];

      const totalPayable = payableFees.reduce(
        (sum, fee) => sum + (fee.amount || 0),
        0
      );
      const totalCollected = collectedFees.reduce(
        (sum, fee) => sum + (fee.amount || 0),
        0
      );
      const balance = totalPayable - totalCollected;

      const nextDueDate = payableFees
        .filter(
          (fee) => fee.status !== "PAID" && new Date(fee.dueDate) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )[0]?.dueDate;

      return {
        id: student.id,
        admissionNumber: student.admissionNumber,
        email: student.email || "",
        firstName: student.profile?.firstName || "N/A",
        lastName: student.profile?.lastName || "N/A",
        idNumber: student.profile?.idNumber || "N/A",
        contactNumber: student.profile?.contactNumber || "N/A",
        admissionDate: student.profile?.admissionDate
          ? new Date(student.profile.admissionDate).toLocaleDateString("en-GB")
          : "N/A",
        cityAndGuildNumber: student.profile?.cityAndGuildNumber || "N/A",
        profileBlocked: student.inactiveReason ? "Yes" : "No",
        campuses: student.campus
          .map((id) => campusMap.get(id) || id)
          .join(", "),
        intakeGroups: student.intakeGroup
          .map((id) => intakeGroupMap.get(id) || id)
          .join(", "),
        totalPayable,
        totalCollected,
        balance,
        nextDueDate: nextDueDate
          ? new Date(nextDueDate).toLocaleDateString("en-GB")
          : "N/A",
        paymentStatus: balance > 0 ? "PENDING" : "PAID",
      };
    });

    return {
      students: transformedStudents,
      pageCount: Math.ceil(totalCount / per_page),
      totalStudents: totalCount,
      summary: {
        totalBalance: transformedStudents.reduce(
          (sum, student) => sum + student.balance,
          0
        ),
        paidCount: transformedStudents.filter(
          (student) => student.paymentStatus === "PAID"
        ).length,
        pendingCount: transformedStudents.filter(
          (student) => student.paymentStatus === "PENDING"
        ).length,
      },
    };
  } catch (error) {
    console.error("Error in getPayableData:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch student data"
    );
  }
};
