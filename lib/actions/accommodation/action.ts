import prisma from "@/lib/db";

export const getAllAccommodations = async () => {
  const accommodations = await prisma.accommodations.findMany({
    select: {
      id: true,
      roomNumber: true,
      address: true,
      roomType: true,
    },
  });

  // Combine the fields to form a title for each accommodation
  return accommodations.map((acc) => ({
    id: acc.id,
    title: `${acc.roomNumber || ""} - ${acc.address || ""} - ${
      acc.roomType || ""
    }`,
  }));
};
