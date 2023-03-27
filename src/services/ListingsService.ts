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

    async getListingById(id: number) : Promise<Listing> {
        return await listingsDataAccess.getListingById(id);
    }

    async searchListings(queryParams: Map<String, any>) : Promise<Listing[]> {
        return await listingsDataAccess.searchListings(queryParams);
    }
}

module.exports = ListingsService;
