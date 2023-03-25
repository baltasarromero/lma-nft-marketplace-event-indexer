//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { BigNumber } from "ethers";


class ListingCreatedEventsDataAccess {

    async saveRawListingCreatedEvent(
        args: Map<string, any>,
        eventBlockNumber: BigNumber,
        transactionHash: string
    ) : Promise<number> {
        try {
            const listingCreatedEvent = await client.listingCreatedEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    price: parseFloat(args["price"].toString()),
                    listingTimestamp: new Date(
                        args["listingTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber.toString(),
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new ListingCreatedEvent");
            return listingCreatedEvent.id;
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, this ListingCreatedEvent is already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = ListingCreatedEventsDataAccess;