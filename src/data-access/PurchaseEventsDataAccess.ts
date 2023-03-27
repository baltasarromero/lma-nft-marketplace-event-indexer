//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { PurchaseEvent } from "@prisma/client";
class PurchaseEventsDataAccess {

    async savePurchaseEvent(
        args: any,
        eventBlockNumber: number,
        transactionHash: string
    ) : Promise<Number> {
        try {
            const purchaseEvent: PurchaseEvent = await client.purchaseEvent.create({
                data: {
                    nftAddress: args["nftAddress"],
                    tokenId: parseInt(args["tokenId"].toString()),
                    seller: args["seller"],
                    buyer: args["buyer"],
                    purchaseTimestamp: new Date(
                        args["purchaseTimestamp"].toString() * 1000
                    ),
                    blockNumber: eventBlockNumber,
                    transactionHash: transactionHash,
                },
            });
            console.log("Saved new PurchaseEvent");
            return purchaseEvent.id;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        "Unique constraint violation, PurchaseEvent already saved."
                    );
                }
            } else {
                throw e;
            }
        }
    }
}

module.exports = PurchaseEventsDataAccess;