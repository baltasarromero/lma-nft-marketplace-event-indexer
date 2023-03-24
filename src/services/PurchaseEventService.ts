const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionDataAccess = require( "../data-access/ExecutionDataAccess" );
const executionDataAccess = new ExecutionDataAccess();
// ListingCreatedEvent
const PurchaseEventDataAccess = require( "../data-access/PurchaseEventDataAccess" );
const purchaseEventDataAccess = new PurchaseEventDataAccess();

class PurchaseEventService {
    /**
     * @description Create an instance of PostService
     */
    constructor() {}

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock = (await executionDataAccess.getLatestExecutionBlock(EventType.PURCHASE)) + 1;
        const currentBlock = await ethereumConfig.provider.getBlockNumber();

        console.log(`Getting Purchase events from block: ${startBlock} to current block: ${currentBlock}`);
        (await this.getPurchaseEvents(startBlock, currentBlock)).forEach(
            (purchaseEvent) => {
                const eventBlockNumber = purchaseEvent.blockNumber;
                const transactionHash = purchaseEvent.transactionHash;
                purchaseEventDataAccess.savePurchaseEvent(
                    purchaseEvent.args,
                    eventBlockNumber,
                    transactionHash
                );
            }
        );

        await executionDataAccess.saveExecution(currentBlock, EventType.PURCHASE);
    }

    async getPurchaseEvents(startBlock: number, currentBlock: number): Promise<Array<Event>> {
        let purchaseEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.Purchase();

        return ethereumConfig.nftContract.queryFilter(
            purchaseEventFilter,
            startBlock,
            currentBlock
        );              
    }
}

module.exports = PurchaseEventService;