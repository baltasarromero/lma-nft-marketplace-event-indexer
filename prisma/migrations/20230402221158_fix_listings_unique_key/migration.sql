/*
  Warnings:

  - A unique constraint covering the columns `[nftAddress,tokenId,status,listedAt]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Listing_nftAddress_tokenId_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "Listing_nftAddress_tokenId_status_listedAt_key" ON "Listing"("nftAddress", "tokenId", "status", "listedAt");
