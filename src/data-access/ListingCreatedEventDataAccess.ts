//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

class ListingCreatedEventDataAccess {

    async saveListingCreatedEvent(
        args: any,
        eventBlockNumber: number,
        transactionHash: string
    ) {
        try {
            await client.listingCreatedEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    price: parseFloat(args["price"].toString()),
                    listingTimestamp: new Date(
                        args["listingTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber,
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new ListingCreatedEvent");
        } catch (e) {
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

module.exports = ListingCreatedEventDataAccess;