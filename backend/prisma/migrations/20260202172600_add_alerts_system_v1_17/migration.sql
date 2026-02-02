/*
  Warnings:

  - You are about to drop the column `REC_SolutionProposed` on the `Reclamation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reclamation" DROP COLUMN "REC_SolutionProposed",
ADD COLUMN     "REC_PreuveName" TEXT,
ADD COLUMN     "REC_PreuveURL" TEXT;
