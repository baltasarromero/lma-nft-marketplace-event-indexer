-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('OPEN', 'CANCELLED', 'ACCEPTED');

-- CreateTable
CREATE TABLE "NFTOffer" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER,
    "offeredPrice" DECIMAL(78,0) NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "status" "OfferStatus" NOT NULL DEFAULT 'OPEN',
    "offerCreatedAt" TIMESTAMP(3) NOT NULL,
    "offerCreatedBlockNumber" DECIMAL(78,0) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBlockNumber" DECIMAL(78,0),
    "acceptedAt" TIMESTAMP(3),
    "acceptedBlockNumber" DECIMAL(78,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NFTOffer_nftAddress_tokenId_sellerId_buyerId_status_key" ON "NFTOffer"("nftAddress", "tokenId", "sellerId", "buyerId", "status");

-- AddForeignKey
ALTER TABLE "NFTOffer" ADD CONSTRAINT "NFTOffer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTOffer" ADD CONSTRAINT "NFTOffer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
