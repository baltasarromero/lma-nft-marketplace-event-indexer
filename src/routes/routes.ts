const express = require("express");
const router = express.Router();

import { indexerAPIConfig } from "../config/config";

// Listings Controller
const ListingsController = require("../controllers/ListingsController");
const listingsController = new ListingsController();
// NFTOffers Controller
const NFTOffersController = require("../controllers/NFTOffersController");
const nftOffersController = new NFTOffersController();

// Error messages
const LISTING_ID_NOT_INT_ERROR = "Listing Id should be an integer";
const OFFER_ID_NOT_INT_ERROR = "Offer Id should be an integer";

// Validations
import {
    CustomValidator,
    query,
    param,
    validationResult,
    Result,
    ValidationError,
} from "express-validator";
const ethers = require("ethers");

// Custom validator for ETH addresses
const isValidAddress: CustomValidator = (value) => {
    if (!ethers.utils.isAddress(value)) {
        throw new Error("Invalid ethereum address");
    }

    return true;
};

router.get(
    "/listings/:id",
    param("id")
        .not()
        .isEmpty()
        .isInt({ min: 0, max: Number.MAX_VALUE })
        .withMessage(LISTING_ID_NOT_INT_ERROR)
        .toInt(),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        // If validations ares passed look up listing by ID
        listingsController.getListingById(req, res);
    }
);

router.get(
    "/listings",
    query("nftAddress").optional().isString().custom(isValidAddress),
    query("buyerAddress").optional().isString().custom(isValidAddress),
    query("sellerAddress").optional().isString().custom(isValidAddress),
    query("status")
        .optional()
        .isString()
        .toUpperCase()
        .isIn(indexerAPIConfig.validStatus),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        listingsController.searchListings(req, res);
    }
);

router.get(
    "/collections/stats",
    query("nftAddress").notEmpty().isString().custom(isValidAddress),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        listingsController.getCollectionStats(req, res);
    }
);

// NFT Offers APIs
router.get(
    "/offers/:id",
    param("id")
        .not()
        .isEmpty()
        .isInt({ min: 0, max: Number.MAX_VALUE })
        .withMessage(OFFER_ID_NOT_INT_ERROR)
        .toInt(),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        // If validations ares passed look up listing by ID
        nftOffersController.getNFTOfferById(req, res);
    }
);

router.get(
    "/offers",
    query("nftAddress").optional().isString().custom(isValidAddress),
    query("tokenId")
        .optional()
        .isInt({ min: 0, max: Number.MAX_VALUE })
        .withMessage(OFFER_ID_NOT_INT_ERROR)
        .toInt(),
    query("status")
        .optional()
        .isString()
        .toUpperCase()
        .isIn(indexerAPIConfig.validOfferStatus),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        nftOffersController.searchNFTOffers(req, res);
    }
);

module.exports = router;
