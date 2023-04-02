import { NFTOffer } from "@prisma/client";

// Import data access
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();
// NFTOffers
const NFTOffersDataAccess = require("../data-access/NFTOffersDataAccess");
const nftOffersDataAccess = new NFTOffersDataAccess();

class NFTOffersService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    // Listings
    async getNFTOfferById(id: number) : Promise<NFTOffer> {
        return await nftOffersDataAccess.getNFTOfferById(id);
    }

    async searchNFTOffers(queryParams: Map<String, any>) : Promise<NFTOffer[]> {
        return await nftOffersDataAccess.searchNFTOffers(queryParams);
    }
}    

module.exports = NFTOffersService;
