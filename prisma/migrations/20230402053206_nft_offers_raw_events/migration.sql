-- CreateTable
CREATE TABLE "NFTOfferCreatedEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "offer" DECIMAL(78,0) NOT NULL,
    "offerCreatedTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTOfferCreatedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTOfferCancelledEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "offerCancelledTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTOfferCancelledEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTOfferAcceptedEvent" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "tokenId" DECIMAL(78,0) NOT NULL,
    "seller" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "offerAcceptedTimestamp" TIMESTAMP(3) NOT NULL,
    "blockNumber" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTOfferAcceptedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferCreatedEvent_nftAddress_tokenId_seller_buyer_offerC_key" ON "NFTOfferCreatedEvent"("nftAddress", "tokenId", "seller", "buyer", "offerCreatedTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferCancelledEvent_nftAddress_tokenId_seller_buyer_offe_key" ON "NFTOfferCancelledEvent"("nftAddress", "tokenId", "seller", "buyer", "offerCancelledTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferAcceptedEvent_nftAddress_tokenId_seller_buyer_offer_key" ON "NFTOfferAcceptedEvent"("nftAddress", "tokenId", "seller", "buyer", "offerAcceptedTimestamp");
