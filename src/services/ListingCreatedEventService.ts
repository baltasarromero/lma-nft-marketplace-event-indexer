const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionDataAccess = require( "../data-access/ExecutionDataAccess" );
const executionDataAccess = new ExecutionDataAccess();
// ListingCreatedEvent
const ListingCreatedEventDataAccess = require( "../data-access/ListingCreatedEventDataAccess" );
const listingCreatedEventDataAccess = new ListingCreatedEventDataAccess();

class ListingCreatedEventService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock = (await executionDataAccess.getLatestExecutionBlock(EventType.LISTING_CREATED)) + 1;
        const currentBlock = await ethereumConfig.provider.getBlockNumber();

        console.log(`Getting ListingCreated events from block: ${startBlock} to current block: ${currentBlock}`);

        const newEvents = await this.getCreatedListingEvents(startBlock, currentBlock);

        for (const listingCreatedEvent of newEvents) {
            const eventBlockNumber = listingCreatedEvent.blockNumber;
            const transactionHash = listingCreatedEvent.transactionHash;
            await listingCreatedEventDataAccess.saveListingCreatedEvent(
                listingCreatedEvent.args,
                eventBlockNumber,
                transactionHash
            );
        }
        
        await executionDataAccess.saveExecution(currentBlock, EventType.LISTING_CREATED);
    }

    async getCreatedListingEvents(startBlock: number, currentBlock: number): Promise<Array<Event>> {
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