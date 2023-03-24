-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPEN', 'CANCELLED', 'PURCHASED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LISTING_CREATED', 'LISTING_CANCELLED', 'PURCHASE');

-- CreateTable
CREATE TABLE "ListingCreatedEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "price" DECIMAL(78,0) NOT NULL,
    "listingTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingCreatedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingCancelledEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "cancelTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingCancelledEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "purchaseTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER,
    "price" DECIMAL(78,0) NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'OPEN',
    "listedAt" TIMESTAMP(3) NOT NULL,
    "listedBlockNumber" DECIMAL(78,0) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBlockNumber" DECIMAL(78,0),
    "purchasedAt" TIMESTAMP(3),
    "purchasedBlockNumber" DECIMAL(78,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" SERIAL NOT NULL,
    "lastBlockNumber" DECIMAL(78,0) NOT NULL,
    "event" "EventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingCreatedEvent_nftAddress_tokenId_listingTimestamp_key" ON "ListingCreatedEvent"("nftAddress", "tokenId", "listingTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ListingCancelledEvent_nftAddress_tokenId_cancelTimestamp_key" ON "ListingCancelledEvent"("nftAddress", "tokenId", "cancelTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_nftAddress_tokenId_status_key" ON "Listing"("nftAddress", "tokenId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Execution_lastBlockNumber_event_key" ON "Execution"("lastBlockNumber", "event");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
