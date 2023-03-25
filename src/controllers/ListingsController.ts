import { Listing } from "@prisma/client";

const ListingDTClass = require("../dtos/ListingDTO");
const listingDTO = new ListingDTClass();

// Import data access
// Listing
const ListingsService = require("../services/ListingsService");
const listingsService = new ListingsService();

// Error messages
const ACTIVE_LISTINGS_500_ERROR = "An error ocurred while retrieving the listings";

class ListingController {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getActiveListingsByCollectionAddress(req, res) {
        try {
            res.status(200).send(await listingsService.getActiveListingsByCollection(req.params.collectionAddress));
        } catch(e){
            // An error ocurrer so we return an error
            res.status(500).send(ACTIVE_LISTINGS_500_ERROR);
        }
    }
}

module.exports = ListingController;
