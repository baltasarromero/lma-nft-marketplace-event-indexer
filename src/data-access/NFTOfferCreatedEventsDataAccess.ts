//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { BigNumber } from "ethers";


class NFTOfferCreatedEventsDataAccess {

    async saveRawNFTOfferCreatedEvent(
        args: Map<string, any>,
        eventBlockNumber: BigNumber,
        transactionHash: string
    ) : Promise<number> {
        try {
            const offerCreatedEvent = await client.nFTOfferCreatedEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    buyer: args["buyer"],
                    offer: parseFloat(args["offer"].toString()),
                    offerCreatedTimestamp: new Date(
                        args["offerCreatedTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber.toString(),
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new NFTOfferCreatedEvent");
            return offerCreatedEvent.id;
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, this NFTOfferCreatedEvent is already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = NFTOfferCreatedEventsDataAccess;