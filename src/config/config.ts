export const indexerAPIConfig = {
    // Listings
    validQueryParams: ["nftAddress", "buyerAddress", "status", "sellerAddress"],
    validStatus: ["OPEN", "CANCELLED", "PURCHASED"],
    // Offers
    validQueryParamsForOffers: ["nftAddress", "tokenId", "status"],
    validOfferStatus: ["OPEN", "CANCELLED", "ACCEPTED"]
}

