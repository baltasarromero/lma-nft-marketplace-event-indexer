const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// ListingCreatedEvent
const PurchaseEventsDataAccess = require("../data-access/PurchaseEventsDataAccess");
const purchaseEventsDataAccess = new PurchaseEventsDataAccess();
// Listing
const ListingsDataAccess = require("../data-access/ListingsDataAccess");
const listingsDataAccess = new ListingsDataAccess();

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

        const purchaseEventId = await purchaseEventsDataAccess.savePurchaseEvent(
            purchaseEvent.args,
            eventBlockNumber,
            transactionHash
        );

        await listingsDataAccess.purchaseListing(
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
            (await executionsDataAccess.getLatestExecutionBlock(
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
    
        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.PURCHASE
        );
    }
}

module.exports = PurchaseEventService;
