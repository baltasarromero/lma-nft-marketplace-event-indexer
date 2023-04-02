/*
  Warnings:

  - A unique constraint covering the columns `[nftAddress,tokenId,listedAt]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Listing_nftAddress_tokenId_status_listedAt_key";

-- CreateIndex
CREATE UNIQUE INDEX "Listing_nftAddress_tokenId_listedAt_key" ON "Listing"("nftAddress", "tokenId", "listedAt");
