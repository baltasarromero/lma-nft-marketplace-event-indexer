import { Listing } from "@prisma/client";

// Import data access
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();

class ListingsService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getActiveListingsByCollection(collectionAddress: string): Promise<Listing[]> {
        return await listingsDataAccess.getActiveListingsByCollection(collectionAddress);
    }
}

module.exports = ListingsService;
