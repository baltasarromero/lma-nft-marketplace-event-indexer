/*
  Warnings:

  - A unique constraint covering the columns `[nftAddress,tokenId,cancelTimestamp]` on the table `ListingCancelledEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ListingCancelledEvent_nftAddress_tokenId_cancelTimestamp_key" ON "ListingCancelledEvent"("nftAddress", "tokenId", "cancelTimestamp");
