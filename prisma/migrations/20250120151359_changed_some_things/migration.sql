/*
  Warnings:

  - Made the column `username` on table `Staff` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Staff` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `Staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;
