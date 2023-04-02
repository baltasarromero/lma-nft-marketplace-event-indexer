/*
  Warnings:

  - Added the required column `offeredPrice` to the `NFTOfferAcceptedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NFTOfferAcceptedEvent" ADD COLUMN     "offeredPrice" DECIMAL(78,0) NOT NULL;
