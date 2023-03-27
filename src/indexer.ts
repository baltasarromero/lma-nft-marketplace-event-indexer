// Import services
// ListingCreatedEvent
const ListingCreatedEventsService = require("./services/ListingCreatedEventsService");
const listingCreatedEventsServiceInstance = new ListingCreatedEventsService();
// ListingCancelledEvent
const ListingCancelledEventsService = require("./services/ListingCancelledEventsService");
const listingCancelledEventsServiceInstance = new ListingCancelledEventsService();
// PurchaseEvent
const PurchaseEventsService = require("./services/PurchaseEventsService");
const purchaseEventsServiceInstance = new PurchaseEventsService();

module.exports = async function () {
    console.log("Starting indexer execution");

    // We force the order of event processing to simplify the logic to consolidate data
    await listingCreatedEventsServiceInstance.getNewEvents();
    await listingCancelledEventsServiceInstance.getNewEvents();
    await purchaseEventsServiceInstance.getNewEvents();
    
    console.log("Finished querying events for NFT Marketplace");
};
