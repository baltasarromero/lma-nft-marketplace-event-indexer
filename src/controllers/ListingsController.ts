import { indexerAPIConfig } from "../config/config";


// Listing
const ListingsService = require("../services/ListingsService");
const listingsService = new ListingsService();

// Valid query params

// Error messages
const SEARCH_LISTINGS_500_ERROR = "An error ocurred while searching listings";
const LISTING_BY_ID_500_ERROR =
    "An error ocurred while trying to get the requested listing";
const LISTING_NOT_FOUND = "Listing not found";
const COLLECTION_STATS_500_ERROR = "An error occurred while trying to retrieve collection stats";
class ListingsController {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getListingById(req, res) {
        try {
            const listing = await listingsService.getListingById(
                parseInt(req.params.id)
            );

            // Return  404 error if the listing wasn't found. This checks both for null and undefined
            if (listing == null) {
                res.status(404).send(LISTING_NOT_FOUND);
            } else {
                // Return listing
                res.status(200).send(listing);
            }
        } catch (e) {
            // An error ocurred so we return an error
            res.status(500).send(LISTING_BY_ID_500_ERROR);
        }
    }

    async searchListings(req, res) {
        try {
            let queryParameters: Map<String, any> = new Map<String, any>();
            // We only let known query params go through to the services. If new parameters shall be added in the future
            // they should be added here
            Object.entries(req.query).map(([key, value]) => {
                if (indexerAPIConfig.validQueryParams.includes(key)) {
                    queryParameters[key] = value;
                }
            });

            res.status(200).send(
                await listingsService.searchListings(queryParameters)
            );
        } catch (e) {
            // An error ocurred so we return an 500 HTTP code
            res.status(500).send(SEARCH_LISTINGS_500_ERROR);
        }
    }

    async getCollectionStats(req, res) {
        try {
            res.status(200).send(
                await listingsService.getCollectionStats(req.query.nftAddress)
            );
        } catch (e) {
            // An error ocurred so we return an 500 HTTP code
            res.status(500).send(COLLECTION_STATS_500_ERROR);
        }
    }
}

module.exports = ListingsController;
