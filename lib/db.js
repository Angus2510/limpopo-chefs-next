// lib/prisma.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add a check for the connection to ensure it's working properly
const checkConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully!");
  } catch (error) {
    console.error("Prisma connection failed:", error);
  }
};

// Call the checkConnection function when the Prisma client is initialized
checkConnection();

export default prisma;
