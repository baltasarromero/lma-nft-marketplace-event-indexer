const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// ListingCreatedEvent
const NFTOfferCreatedEventsDataAccess = require("../data-access/NFTOfferCreatedEventsDataAccess");
const nftOfferCreatedEventsDataAccess = new NFTOfferCreatedEventsDataAccess();
// NFTOffers
const NFTOffersDataAccess = require("../data-access/NFTOffersDataAccess");
const nftOffersDataAccess = new NFTOffersDataAccess();

class NFTOfferCreatedEventsService {
    /**
     * @description
     */
    constructor() {}

    async saveRawEventAndProcess(nftOfferCreatedEvent: Event) {
        const eventBlockNumber = nftOfferCreatedEvent.blockNumber;
        const transactionHash = nftOfferCreatedEvent.transactionHash;
        // Save raw event
        const offerCreatedEventId: number =
            await nftOfferCreatedEventsDataAccess.saveRawNFTOfferCreatedEvent(
                nftOfferCreatedEvent.args,
                eventBlockNumber,
                transactionHash
            );

        // Process  event and create/update offer state
        await nftOffersDataAccess.saveNFTOffer(
            offerCreatedEventId,
            nftOfferCreatedEvent.args["nftAddress"],
            nftOfferCreatedEvent.args["tokenId"],
            nftOfferCreatedEvent.args["seller"],
            nftOfferCreatedEvent.args["buyer"],
            nftOfferCreatedEvent.args["offer"],
            nftOfferCreatedEvent.args["offerCreatedTimestamp"],
            nftOfferCreatedEvent.blockNumber
        );
    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock: number =
            (await executionsDataAccess.getLatestExecutionBlock(
                EventType.OFFER_CREATED
            )) + 1;
        const currentBlock: number =
            await ethereumConfig.provider.getBlockNumber();

        console.log(
            `Getting NFTOfferCreated events from block: ${startBlock} to current block: ${currentBlock}`
        );

        const newEvents: Array<Event> = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        // Save and process all events
        for (const nftOfferCreatedEvent of newEvents) {
            await this.saveRawEventAndProcess(nftOfferCreatedEvent);
        }

        // Save the current execution with the currentBlock to allow resuming from this point on the next run
        console.log("Saving execution");
        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.OFFER_CREATED
        );
    }

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        try {
            let nftOfferCreatedEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.NewNFTOffer();

            return ethereumConfig.nftContract.queryFilter(
                nftOfferCreatedEventFilter,
                startBlock,
                currentBlock
            );
        } catch (error) {
            console.log(error);
            return;
        }   
    }
}

module.exports = NFTOfferCreatedEventsService;
