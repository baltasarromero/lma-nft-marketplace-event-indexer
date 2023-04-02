//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { BigNumber } from "ethers";


class NFTOfferCancelledEventsDataAccess {

    async saveRawNFTOfferCancelledEvent(
        args: Map<string, any>,
        eventBlockNumber: BigNumber,
        transactionHash: string
    ) : Promise<number> {
        try {
            const offerCancelledEvent = await client.nFTOfferCancelledEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    buyer: args["buyer"],
                    offerCancelledTimestamp: new Date(
                        args["offerCancelledTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber.toString(),
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new NFTOfferCancelledEvent");
            return offerCancelledEvent.id;
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, this NFTOfferCancelledEvent is already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = NFTOfferCancelledEventsDataAccess;