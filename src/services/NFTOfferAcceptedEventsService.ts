const ethereumConfig = require("../config/eth-network");
import { Event, EventFilter } from "@ethersproject/contracts";
const { EventType } = require("@prisma/client");
// Import data access
// Execution
const ExecutionsDataAccess = require("../data-access/ExecutionsDataAccess");
const executionsDataAccess = new ExecutionsDataAccess();
// NFTOfferAcceptedEvent
const NFTOfferAcceptedEventsDataAccess = require("../data-access/NFTOfferAcceptedEventsDataAccess");
const nftOfferAcceptedEventsDataAccess = new NFTOfferAcceptedEventsDataAccess();
// NFTOffers
const NFTOffersDataAccess = require("../data-access/NFTOffersDataAccess");
const nftOffersDataAccess = new NFTOffersDataAccess();

class NFTOfferAcceptedEventsService {
    /**
     * @description
     */
    constructor() {}

    async saveRawEventAndProcess(nftOfferAcceptedEvent: Event) {
        const eventBlockNumber = nftOfferAcceptedEvent.blockNumber;
        const transactionHash = nftOfferAcceptedEvent.transactionHash;
        // Save raw event
        const offerAcceptedEventId: number =
            await nftOfferAcceptedEventsDataAccess.saveRawNFTOfferAcceptedEvent(
                nftOfferAcceptedEvent.args,
                eventBlockNumber,
                transactionHash
            );

        // Process  event and create/update offer state
        await nftOffersDataAccess.acceptNFTOffer(
            offerAcceptedEventId,
            nftOfferAcceptedEvent.args["nftAddress"],
            nftOfferAcceptedEvent.args["tokenId"],
            nftOfferAcceptedEvent.args["buyer"],
            nftOfferAcceptedEvent.args["offerAcceptedTimestamp"],
            nftOfferAcceptedEvent.blockNumber
        );
    }

    async getNewEvents() {
        // Get start and current block to restrict the event filtering
        const startBlock: number =
            (await executionsDataAccess.getLatestExecutionBlock(
                EventType.OFFER_ACCEPTED
            )) + 1;
        const currentBlock: number =
            await ethereumConfig.provider.getBlockNumber();

        console.log(
            `Getting NFTOfferAccepted events from block: ${startBlock} to current block: ${currentBlock}`
        );

        const newEvents: Array<Event> = await this.getEventsFromBlockchain(
            startBlock,
            currentBlock
        );

        // Save and process all events
        for (const nftOfferAcceptedEvent of newEvents) {
            await this.saveRawEventAndProcess(nftOfferAcceptedEvent);
        }

        // Save the current execution with the currentBlock to allow resuming from this point on the next run
        console.log("Saving execution");
        await executionsDataAccess.saveExecution(
            currentBlock,
            EventType.OFFER_ACCEPTED
        );
    }

    async getEventsFromBlockchain(
        startBlock: number,
        currentBlock: number
    ): Promise<Array<Event>> {
        try {
            let nftOfferAcceptedEventFilter: EventFilter =
            ethereumConfig.nftContract.filters.NFTOfferAccepted();

            return ethereumConfig.nftContract.queryFilter(
                nftOfferAcceptedEventFilter,
                startBlock,
                currentBlock
            );
        } catch (error) {
            console.log(error);
            return;
        }   
    }
}

module.exports = NFTOfferAcceptedEventsService;
