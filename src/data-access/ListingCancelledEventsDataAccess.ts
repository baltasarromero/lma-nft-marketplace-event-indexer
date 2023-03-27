//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import  { ListingCancelledEvent } from "@prisma/client";

class ListingCancelledEventsDataAccess {

    async saveRawListingCancelledEvent(
        args: any,
        eventBlockNumber: number,
        transactionHash: string
    ) : Promise<Number> {
        try {
            const listingCancelledEvent: ListingCancelledEvent = await client.listingCancelledEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    cancelTimestamp: new Date(
                        args["cancelTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber,
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new ListingCancelledEvent");
            return listingCancelledEvent.id;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, this ListingCancelledEvent is already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = ListingCancelledEventsDataAccess;