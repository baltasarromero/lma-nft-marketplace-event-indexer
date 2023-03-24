// Import services
// ListingCreatedEvent
const ListingCreatedEventService = require("./services/ListingCreatedEventService");
const listingCreatedEventServiceInstance = new ListingCreatedEventService();
// ListingCancelledEvent
const ListingCancelledEventService = require("./services/ListingCancelledEventService");
const listingCancelledEventServiceInstance = new ListingCancelledEventService();
// PurchaseEvent
const PurchaseEventService = require("./services/PurchaseEventService");
const purchaseEventServiceInstance = new PurchaseEventService();

async function main() {
    await Promise.all([
        listingCreatedEventServiceInstance.getNewEvents(),
        listingCancelledEventServiceInstance.getNewEvents(),
        purchaseEventServiceInstance.getNewEvents(),
    ]);

    console.log("Finished querying events for NFT Marketplace");
}

main();
