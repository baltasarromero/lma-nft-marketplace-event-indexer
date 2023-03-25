const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// ListingCreatedEvent
const ListingCancelledEventsDataAccess = require("../data-access/ListingCancelledEventsDataAccess");
const listingCancelledEventsDataAccess = new ListingCancelledEventsDataAccess();
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();

class ListingCancelledEventsService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        let listingCancelledEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.ListingCancelled();

        return ethereumConfig.nftContract.queryFilter(
            listingCancelledEventFilter,
            startBlock,
            currentBlock
        );
    }

    async saveRawEventAndProcess(listingCancelledEvent: Event) {
        const eventBlockNumber = listingCancelledEvent.blockNumber;
        const transactionHash = listingCancelledEvent.transactionHash;

        const listingCancelledEventId = await listingCancelledEventsDataAccess.saveRawListingCancelledEvent(
            listingCancelledEvent.args,
            eventBlockNumber,
            transactionHash
        );

        await listingsDataAccess.cancelListing(
            listingCancelledEventId,
            listingCancelledEvent.args["nftAddress"],
            listingCancelledEvent.args["tokenId"],
            listingCancelledEvent.args["cancelTimestamp"],
            eventBlockNumber
        );    

    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock =
            (await executionsDataAccess.getLatestExecutionBlock(
                EventType.LISTING_CANCELLED
            )) + 1;
        const currentBlock = await ethereumConfig.provider.getBlockNumber();

        console.log(
            `Getting ListingCancelled events from block: ${startBlock} to current block: ${currentBlock}`
        );

        const newEvents = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        // Save and process all events
        for (const listingCancelled of newEvents) {
            await this.saveRawEventAndProcess(listingCancelled);
        }

        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.LISTING_CANCELLED
        );
    }
}

module.exports = ListingCancelledEventsService;
