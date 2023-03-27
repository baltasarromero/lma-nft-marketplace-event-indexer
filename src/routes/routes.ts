const express = require("express");
const router = express.Router();


import { indexerAPIConfig } from "../config/config";

const ListingsController = require("../controllers/ListingsController");
const listingsController = new ListingsController();

// Error messages
const LISTING_ID_NOT_INT_ERROR = "Listing Id should be an integer";

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
    query("status").optional().isString().toUpperCase().isIn(indexerAPIConfig.validStatus),
    (req, res) => {
        // Check if there are any validation errors
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        listingsController.searchListings(req, res);
    }
);

module.exports = router;
