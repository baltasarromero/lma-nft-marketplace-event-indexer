/*
  Warnings:

  - A unique constraint covering the columns `[nftAddress,tokenId,buyer,offerAcceptedTimestamp]` on the table `NFTOfferAcceptedEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nftAddress,tokenId,buyer,offerCancelledTimestamp]` on the table `NFTOfferCancelledEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nftAddress,tokenId,buyer,offerCreatedTimestamp]` on the table `NFTOfferCreatedEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nftAddress,tokenId,purchaseTimestamp]` on the table `PurchaseEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "NFTOfferAcceptedEvent_nftAddress_tokenId_seller_buyer_offer_key";

-- DropIndex
DROP INDEX "NFTOfferCancelledEvent_nftAddress_tokenId_seller_buyer_offe_key";

-- DropIndex
DROP INDEX "NFTOfferCreatedEvent_nftAddress_tokenId_seller_buyer_offerC_key";

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferAcceptedEvent_nftAddress_tokenId_buyer_offerAccepte_key" ON "NFTOfferAcceptedEvent"("nftAddress", "tokenId", "buyer", "offerAcceptedTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferCancelledEvent_nftAddress_tokenId_buyer_offerCancel_key" ON "NFTOfferCancelledEvent"("nftAddress", "tokenId", "buyer", "offerCancelledTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "NFTOfferCreatedEvent_nftAddress_tokenId_buyer_offerCreatedT_key" ON "NFTOfferCreatedEvent"("nftAddress", "tokenId", "buyer", "offerCreatedTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseEvent_nftAddress_tokenId_purchaseTimestamp_key" ON "PurchaseEvent"("nftAddress", "tokenId", "purchaseTimestamp");
