const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// ListingCreatedEvent
const ListingCreatedEventsDataAccess = require("../data-access/ListingCreatedEventsDataAccess");
const listingCreatedEventsDataAccess = new ListingCreatedEventsDataAccess();
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();

class ListingCreatedEventsService {
    /**
     * @description
     */
    constructor() {}

    async saveRawEventAndProcess(listingCreatedEvent: Event) {
        const eventBlockNumber = listingCreatedEvent.blockNumber;
        const transactionHash = listingCreatedEvent.transactionHash;
        // Save raw event
        const listingCreatedEventId: number =
            await listingCreatedEventsDataAccess.saveRawListingCreatedEvent(
                listingCreatedEvent.args,
                eventBlockNumber,
                transactionHash
            );

        // Process  event and create/update listing state
        await listingsDataAccess.saveListing(
            listingCreatedEventId,
            listingCreatedEvent.args["nftAddress"],
            listingCreatedEvent.args["tokenId"],
            listingCreatedEvent.args["seller"],
            listingCreatedEvent.args["price"],
            listingCreatedEvent.args["listingTimestamp"],
            listingCreatedEvent.blockNumber
        );
    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock: number =
            (await executionsDataAccess.getLatestExecutionBlock(
                EventType.LISTING_CREATED
            )) + 1;
        const currentBlock: number =
            await ethereumConfig.provider.getBlockNumber();

        console.log(
            `Getting ListingCreated events from block: ${startBlock} to current block: ${currentBlock}`
        );

        const newEvents: Array<Event> = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        // Save and process all events
        for (const listingCreatedEvent of newEvents) {
            await this.saveRawEventAndProcess(listingCreatedEvent);
        }

        // Save the current execution with the currentBlock to allow resuming from this point on the next run
        console.log("Saving execution");
        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.LISTING_CREATED
        );
    }

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        let listingCreatedEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.ListingCreated();

        return ethereumConfig.nftContract.queryFilter(
            listingCreatedEventFilter,
            startBlock,
            currentBlock
        );
    }
}

module.exports = ListingCreatedEventsService;
