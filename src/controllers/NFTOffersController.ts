import { indexerAPIConfig } from "../config/config";

// Offers
const NFTOffersService = require("../services/NFTOffersService");
const nftOffersService = new NFTOffersService();

// Error messages
const SEARCH_OFFERS_500_ERROR = "An error ocurred while searching offers";
const OFFER_BY_ID_500_ERROR =
    "An error ocurred while trying to get the requested NFT offer";
const OFFER_NOT_FOUND = "NFT offer not found";

class OffersController {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getNFTOfferById(req, res) {
        try {
            const nftOffer = await nftOffersService.getNFTOfferById(
                parseInt(req.params.id)
            );

            // Return  404 error if the listing wasn't found. This checks both for null and undefined
            if (nftOffer == null) {
                res.status(404).send(OFFER_NOT_FOUND);
            } else {
                // Return listing
                res.status(200).send(nftOffer);
            }
        } catch (e) {
            // An error ocurred so we return an error
            res.status(500).send(OFFER_BY_ID_500_ERROR);
        }
    }

    async searchNFTOffers(req, res) {
        try {
            let queryParameters: Map<String, any> = new Map<String, any>();
            // We only let known query params go through to the services. If new parameters shall be added in the future
            // they should be added here
            Object.entries(req.query).map(([key, value]) => {
                if (indexerAPIConfig.validQueryParamsForOffers.includes(key)) {
                    queryParameters[key] = value;
                }
            });

            res.status(200).send(
                await nftOffersService.searchNFTOffers(queryParameters)
            );
        } catch (e) {
            // An error ocurred so we return an 500 HTTP code
            res.status(500).send(SEARCH_OFFERS_500_ERROR);
        }
    }

}

module.exports = OffersController;
