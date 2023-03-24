const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionDataAccess = require("../data-access/ExecutionDataAccess");
const executionDataAccess = new ExecutionDataAccess();
// ListingCreatedEvent
const ListingCreatedEventDataAccess = require("../data-access/ListingCreatedEventDataAccess");
const listingCreatedEventDataAccess = new ListingCreatedEventDataAccess();
// Listing
const ListingDataAccess = require("../data-access/ListingDataAccess");
const listingDataAccess = new ListingDataAccess();

class ListingCreatedEventService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async processEvent(listingCreatedEvent: Event) {
        // Lookup the listing if it's not in the DB save it if it was marked as created ignore as this event
        // was already processed if it's marked as cancelled but the creation data is missing we could update the listing
    }

    async saveRawEventAndProcess(listingCreatedEvent: Event) {
        const eventBlockNumber = listingCreatedEvent.blockNumber;
        const transactionHash = listingCreatedEvent.transactionHash;
        // Save raw event
        const listingCreatedEventId: number =
            await listingCreatedEventDataAccess.saveRawListingCreatedEvent(
                listingCreatedEvent.args,
                eventBlockNumber,
                transactionHash
            );

        // Process  event and create/update listing state
        await listingDataAccess.saveListing(
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
            (await executionDataAccess.getLatestExecutionBlock(
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
        await executionDataAccess.saveExecution(
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

module.exports = ListingCreatedEventService;
