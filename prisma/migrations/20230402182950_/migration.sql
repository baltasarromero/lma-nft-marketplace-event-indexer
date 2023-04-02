/*
  Warnings:

  - A unique constraint covering the columns `[nftAddress,tokenId,buyerId,offerCreatedAt]` on the table `NFTOffer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "NFTOffer_nftAddress_tokenId_buyerId_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "NFTOffer_nftAddress_tokenId_buyerId_offerCreatedAt_key" ON "NFTOffer"("nftAddress", "tokenId", "buyerId", "offerCreatedAt");
