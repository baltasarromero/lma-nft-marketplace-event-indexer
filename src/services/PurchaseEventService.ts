const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionDataAccess = require("../data-access/ExecutionDataAccess");
const executionDataAccess = new ExecutionDataAccess();
// ListingCreatedEvent
const PurchaseEventDataAccess = require("../data-access/PurchaseEventDataAccess");
const purchaseEventDataAccess = new PurchaseEventDataAccess();
// Listing
const ListingDataAccess = require("../data-access/ListingDataAccess");
const listingDataAccess = new ListingDataAccess();

class PurchaseEventService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        let purchaseEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.Purchase();

        return ethereumConfig.nftContract.queryFilter(
            purchaseEventFilter,
            startBlock,
            currentBlock
        );
    }

    async saveRawEventAndProcess(purchaseEvent: Event) {
        const eventBlockNumber = purchaseEvent.blockNumber;
        const transactionHash = purchaseEvent.transactionHash;

        const purchaseEventId = await purchaseEventDataAccess.savePurchaseEvent(
            purchaseEvent.args,
            eventBlockNumber,
            transactionHash
        );

        await listingDataAccess.purchaseListing(
            purchaseEventId,
            purchaseEvent.args["nftAddress"],
            purchaseEvent.args["tokenId"],
            purchaseEvent.args["buyer"],
            purchaseEvent.args["purchaseTimestamp"],
            eventBlockNumber
        );    

    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock =
            (await executionDataAccess.getLatestExecutionBlock(
                EventType.PURCHASE
            )) + 1;
        const currentBlock = await ethereumConfig.provider.getBlockNumber();

        const newEvents = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        for (const purchaseEvent of newEvents) {
           await this.saveRawEventAndProcess(purchaseEvent);
        }
    
        await executionDataAccess.saveExecution(
            currentBlock,
            EventType.PURCHASE
        );
    }
}

module.exports = PurchaseEventService;
