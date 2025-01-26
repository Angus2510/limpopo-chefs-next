// staff-query.js
import prisma from "@/lib/db.js";

async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      // You can add select fields if you don't want all columns
      // select: {
      //   id: true,
      //   name: true,
      //   email: true,
      // },
      // Add where clause if you need filtering
      // where: {
      //   active: true,
      // },
      // Add orderBy if you need sorting
      // orderBy: {
      //   name: 'asc',
      // },
    });

    console.log("Staff retrieved successfully:");
    console.log(JSON.stringify(staff, null, 2));
    return staff;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Self-executing async function to run the query
(async () => {
  try {
    await getStaff();
  } catch (error) {
    console.error("Failed to execute query:", error);
    process.exit(1);
  }
})();
