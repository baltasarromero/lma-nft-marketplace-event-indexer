import { Listing } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/index";

// Import data access
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();
// NFTOffers
const NFTOffersDataAccess = require("../data-access/NFTOffersDataAccess");
const nftOffersDataAccess = new NFTOffersDataAccess();

class ListingsService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getListingById(id: number) : Promise<Listing> {
        return await listingsDataAccess.getListingById(id);
    }

    async searchListings(queryParams: Map<String, any>) : Promise<Listing[]> {
        return await listingsDataAccess.searchListings(queryParams);
    }

    async getCollectionStats(collectionAddress: string) : Promise<Object> {
        const floorPrice: Decimal = await listingsDataAccess.getFloorPrice(collectionAddress);
        const tradedVolume: Decimal = await listingsDataAccess.getTradedVolume(collectionAddress);
        const bestOffer: Decimal = await nftOffersDataAccess.getBestOffer(collectionAddress);

        const result = {
            nftAddress: collectionAddress,
            floorPrice: floorPrice,
            tradedVolume: tradedVolume,
            bestOffer: bestOffer,
        }

        return result;
    }
}

module.exports = ListingsService;
