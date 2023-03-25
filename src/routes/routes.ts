const express = require("express");
const router = express.Router();

const ListingsController = require("../controllers/ListingsController");
const listingsController = new ListingsController();

router.get("/listings", (req, res) => {
    res.send("All Listings");
});

router.get("/listings/open/:collectionAddress", [
        listingsController.getActiveListingsByCollectionAddress    
    ]    
);

module.exports = router;