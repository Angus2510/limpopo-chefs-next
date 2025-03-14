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

  // Split search query into terms and search across multiple fields
  if (search) {
    const searchTerms = search.split(" ");
    whereConditions.AND = searchTerms.map((term) => ({
      OR: [
        {
          admissionNumber: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          profile: {
            is: {
              firstName: {
                contains: term,
                mode: "insensitive",
              },
            },
          },
        },
        {
          profile: {
            is: {
              lastName: {
                contains: term,
                mode: "insensitive",
              },
            },
          },
        },
        {
          profile: {
            is: {
              idNumber: {
                contains: term,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }));
  }

  if (email) {
    whereConditions.email = {
      contains: email,
      mode: "insensitive",
    };
  }

  // Initialize the campus and intake group maps
  const campusMap: { [key: string]: string } = {};
  const intakeGroupMap: { [key: string]: string } = {};

  // Fetch campus IDs for given campus titles if filtered
  let campusIds: string[] = [];
  if (campusTitles && campusTitles.length > 0) {
    const campuses = await prisma.campus.findMany({
      where: {
        title: { in: campusTitles },
      },
      select: {
        id: true,
        title: true,
      },
    });
    campusIds = campuses.map((campus) => campus.id);
    campuses.forEach((campus) => {
      campusMap[campus.id] = campus.title;
    });
  }

  // Fetch intake group IDs for given intake group titles if filtered
  let intakeGroupIds: string[] = [];
  if (intakeGroupTitles && intakeGroupTitles.length > 0) {
    const intakeGroups = await prisma.intakeGroup.findMany({
      where: {
        title: { in: intakeGroupTitles },
      },
      select: {
        id: true,
        title: true,
      },
    });
    intakeGroupIds = intakeGroups.map((intakeGroup) => intakeGroup.id);
    intakeGroups.forEach((intakeGroup) => {
      intakeGroupMap[intakeGroup.id] = intakeGroup.title;
    });
  }

  if (campusIds.length > 0) {
    whereConditions.campus = { hasSome: campusIds };
  }

  if (intakeGroupIds.length > 0) {
    whereConditions.intakeGroup = { hasSome: intakeGroupIds };
  }

  let orderByCondition = {};

  if (sortColumn === "firstName" || sortColumn === "lastName") {
    orderByCondition = {
      profile: {
        [sortColumn]: sortOrder,
      },
    };
  } else {
    orderByCondition = { [sortColumn]: sortOrder };
  }

  const data = await prisma.student.findMany({
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

  const totalStudents = await prisma.student.count({
    where: whereConditions,
  });

  const studentIds = data.map((student) => student.id);
  const finances = await prisma.finance.findMany({
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

  const financeMap = finances.reduce((acc: any, finance) => {
    acc[finance.student] = finance.payableFees;
    return acc;
  }, {});

  const pageCount = Math.ceil(totalStudents / per_page);

  // Collect all unique campus and intake group IDs from the fetched students
  const allCampusIds = new Set<string>();
  const allIntakeGroupIds = new Set<string>();
  data.forEach((student) => {
    student.campus.forEach((id) => allCampusIds.add(id));
    student.intakeGroup.forEach((id) => allIntakeGroupIds.add(id));
  });

  // Fetch titles for all unique campus IDs
  const campuses = await prisma.campus.findMany({
    where: {
      id: { in: Array.from(allCampusIds) },
    },
    select: {
      id: true,
      title: true,
    },
  });
  campuses.forEach((campus) => {
    campusMap[campus.id] = campus.title;
  });

  // Fetch titles for all unique intake group IDs
  const intakeGroups = await prisma.intakeGroup.findMany({
    where: {
      id: { in: Array.from(allIntakeGroupIds) },
    },
    select: {
      id: true,
      title: true,
    },
  });
  intakeGroups.forEach((intakeGroup) => {
    intakeGroupMap[intakeGroup.id] = intakeGroup.title;
  });

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
