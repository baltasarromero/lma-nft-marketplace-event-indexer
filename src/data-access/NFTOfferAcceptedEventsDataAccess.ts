//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { BigNumber } from "ethers";


class NFTOfferAcceptedEventsDataAccess {

    async saveRawNFTOfferAcceptedEvent(
        args: Map<string, any>,
        eventBlockNumber: BigNumber,
        transactionHash: string
    ) : Promise<number> {
        try {
            const offerAcceptedEvent = await client.nFTOfferAcceptedEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    buyer: args["buyer"],
                    offeredPrice: parseFloat(args["offeredPrice"].toString()),
                    offerAcceptedTimestamp: new Date(
                        args["offerAcceptedTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber.toString(),
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new NFTOfferAcceptedEvent");
            return offerAcceptedEvent.id;
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, this NFTOfferAcceptedEvent is already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = NFTOfferAcceptedEventsDataAccess;