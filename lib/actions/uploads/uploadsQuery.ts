import prisma from "@/lib/db";
import { type UploadsSearchParams } from "@/types/uploads/uploads";

export const getUploadsData = async (input: UploadsSearchParams) => {
  const {
    page = 1,
    per_page = 10,
    sort = "title.asc",
    search,
    intakeGroupTitles,
  } = input;

  const offset = (page - 1) * per_page;
  const [sortColumn, sortOrder] = sort.split(".") as [string, "asc" | "desc"];

  if (!sortColumn || !sortOrder) {
    throw new Error("Invalid sort parameter");
  }

  const whereConditions: any = {};

  // Split search query into terms and search across multiple fields
  if (search) {
    const searchTerms = search.split(" ");
    whereConditions.AND = searchTerms.map((term) => ({
      OR: [
        {
          title: {
            contains: term,
            mode: "insensitive",
          },
        },
      ],
    }));
  }

  const intakeGroupMap: { [key: string]: string } = {};

  // Fetch intake group IDs for given intake group titles if filtered
  let intakeGroupIds: string[] = [];
  if (intakeGroupTitles && intakeGroupTitles.length > 0) {
    const intakeGroups = await prisma.intakegroups.findMany({
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

  if (intakeGroupIds.length > 0) {
    // Use the $in operator to check if any of the intakeGroup IDs match
    whereConditions.intakeGroup = { hasSome: intakeGroupIds };
  }

  let orderByCondition = {};

  orderByCondition = { [sortColumn]: sortOrder };

  const data = await prisma.learningmaterials.findMany({
    where: whereConditions,
    select: {
      id: true,
      title: true,
      description: true,
      intakeGroup: true,
    },
    skip: offset,
    take: per_page,
    orderBy: orderByCondition,
  });

  const totalUploads = await prisma.learningmaterials.count({
    where: whereConditions,
  });

  const pageCount = Math.ceil(totalUploads / per_page);

  const allIntakeGroupIds = new Set<string>();

  data.forEach((uploads) => {
    uploads.intakeGroup.forEach((id) => allIntakeGroupIds.add(id));
  });

  // Fetch titles for all unique intake group IDs
  const intakeGroups = await prisma.intakegroups.findMany({
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

  const uploads = data.map((uploads) => ({
    id: uploads.id,
    title: uploads.title || "",
    description: uploads.description || "",
    intakeGroups: uploads.intakeGroup
      .map((id) => intakeGroupMap[id] || id)
      .join(", "),
  }));

  return { uploads, pageCount };
};
