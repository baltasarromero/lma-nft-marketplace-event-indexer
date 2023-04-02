const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// ListingCreatedEvent
const NFTOfferCancelledEventsDataAccess = require("../data-access/NFTOfferCancelledEventsDataAccess");
const nftOfferCancelledEventsDataAccess = new NFTOfferCancelledEventsDataAccess();
// NFTOffers
const NFTOffersDataAccess = require("../data-access/NFTOffersDataAccess");
const nftOffersDataAccess = new NFTOffersDataAccess();

class NFTOfferCancelledEventsService {
    /**
     * @description
     */
    constructor() {}

    async saveRawEventAndProcess(nftOfferCancelledEvent: Event) {
        const eventBlockNumber = nftOfferCancelledEvent.blockNumber;
        const transactionHash = nftOfferCancelledEvent.transactionHash;
        // Save raw event
        const offerCancelledEventId: number =
            await nftOfferCancelledEventsDataAccess.saveRawNFTOfferCancelledEvent(
                nftOfferCancelledEvent.args,
                eventBlockNumber,
                transactionHash
            );

        // Process  event and create/update offer state
        await nftOffersDataAccess.cancelNFTOffer(
            offerCancelledEventId,
            nftOfferCancelledEvent.args["nftAddress"],
            nftOfferCancelledEvent.args["tokenId"],
            nftOfferCancelledEvent.args["buyer"],
            nftOfferCancelledEvent.args["offerCancelledTimestamp"],
            eventBlockNumber
        );        
       
    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock: number =
            (await executionsDataAccess.getLatestExecutionBlock(
                EventType.OFFER_CANCELLED
            )) + 1;
        const currentBlock: number =
            await ethereumConfig.provider.getBlockNumber();

        console.log(
            `Getting NFTOfferCancelled events from block: ${startBlock} to current block: ${currentBlock}`
        );

        const newEvents: Array<Event> = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        // Save and process all events
        for (const nftOfferCancelledEvent of newEvents) {
            await this.saveRawEventAndProcess(nftOfferCancelledEvent);
        }

        // Save the current execution with the currentBlock to allow resuming from this point on the next run
        console.log("Saving execution");
        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.OFFER_CANCELLED
        );
    }

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        try {
            let nftOfferCancelledEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.NFTOfferCancelled();

            return ethereumConfig.nftContract.queryFilter(
                nftOfferCancelledEventFilter,
                startBlock,
                currentBlock
            );
        } catch (error) {
            console.log(error);
            return;
        }   
    }
}

module.exports = NFTOfferCancelledEventsService;
