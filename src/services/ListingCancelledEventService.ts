const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionDataAccess = require( "../data-access/ExecutionDataAccess" );
const executionDataAccess = new ExecutionDataAccess();
// ListingCreatedEvent
const ListingCancelledEventDataAccess = require( "../data-access/ListingCancelledEventDataAccess" );
const listingCancelledEventDataAccess = new ListingCancelledEventDataAccess();

class ListingCancelledEventService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}


    async saveEventsToDB(events: Array<Event>) {
        for await (const listingCancelledEvent of events) {
            const eventBlockNumber = listingCancelledEvent.blockNumber;
            const transactionHash = listingCancelledEvent.transactionHash;
            listingCancelledEventDataAccess.saveListingCancelledEvent(
                listingCancelledEvent.args,
                eventBlockNumber,
                transactionHash
            );
        }
    }

    async getEventsFromBlockchain(startBlock: number, currentBlock: number): Promise<Array<Event>> {
        let listingCancelledEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.ListingCancelled();

        return ethereumConfig.nftContract.queryFilter(
            listingCancelledEventFilter,
            startBlock,
            currentBlock
        );              
    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock = (await executionDataAccess.getLatestExecutionBlock(EventType.LISTING_CANCELLED)) + 1;
        const currentBlock = await ethereumConfig.provider.getBlockNumber();

        console.log(`Getting ListingCancelled events from block: ${startBlock} to current block: ${currentBlock}`);
        
        const newEvents = await this.getEventsFromBlockchain(startBlock, currentBlock)
        
        for (const listingCancelledEvent of newEvents) {
            const eventBlockNumber = listingCancelledEvent.blockNumber;
            const transactionHash = listingCancelledEvent.transactionHash;
            await listingCancelledEventDataAccess.saveListingCancelledEvent(
                listingCancelledEvent.args,
                eventBlockNumber,
                transactionHash
            );
        }
    
        await executionDataAccess.saveExecution(currentBlock, EventType.LISTING_CANCELLED);
    }

  
}

module.exports = ListingCancelledEventService;