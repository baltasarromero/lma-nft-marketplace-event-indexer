//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { Status, Listing } from "@prisma/client";
import { BigNumber } from "ethers";

class ListingsDataAccess {
    async saveListing(
        listingCreatedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        seller: string,
        price: BigNumber,
        listingTimestamp: any,
        listingBlockNumber: BigNumber
    ) {
        try {
            await client.listing.create({
                data: {
                    nftAddress: nftAddress,
                    tokenId: tokenId.toString(),
                    seller: {
                        connectOrCreate: {
                            where: {
                                address: seller,
                            },
                            create: {
                                address: seller,
                            },
                        },
                    },
                    price: price.toString(),
                    listedAt: new Date(listingTimestamp.toString() * 1000),
                    listedBlockNumber: listingBlockNumber.toString(),
                },
            });
            console.log("Saved new processed Listing");
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        `Unique constraint violation, Listing for nftAddress: ${nftAddress}, tokenId: ${tokenId} and listing timestamp: ${listingTimestamp} is already saved. You should review CreatedListingEvent with id: ${listingCreatedEventId}`
                    );
                }
            } else {
                throw e;
            }
        }
    }

    async cancelListing(
        listingCancelledEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        cancelTimestamp: any,
        cancelBlockNumber: BigNumber
    ) {
        try {
            console.log("Cancelling listing");

            await client.listing.update({
                where: {
                    nftAddress_tokenId_status: {
                        nftAddress: nftAddress,
                        tokenId: tokenId.toString(),
                        status: Status.OPEN, // The assumption is that there must be one and only one Listing OPEN for the combination of NFTAddress and TokenId
                    },
                },
                data: {
                    status: Status.CANCELLED,
                    cancelledAt: new Date(cancelTimestamp.toString() * 1000),
                    cancelledBlockNumber: cancelBlockNumber.toString(),
                },
            });
            console.log("Processed Listing Cancellation");
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.RecordNotFound) {
                //if (e.code === "P2002") {
                console.log(
                    `Listing not found, there's no OPEN Listing for nftAddress: ${nftAddress}, tokenId: ${tokenId}. You should review CancelledListingEvent with id: ${listingCancelledEventId}`
                );
                //}
            } else {
                throw e;
            }
        }
    }

    async purchaseListing(
        listingPurchasedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        buyer: string,
        purchaseTimestamp: any,
        purchaseBlockNumber: BigNumber
    ) {
        try {
            console.log("Purchase listing");

            await client.listing.update({
                where: {
                    nftAddress_tokenId_status: {
                        nftAddress: nftAddress,
                        tokenId: tokenId.toString(),
                        status: Status.OPEN, // The assumption is that there must be one and only one Listing OPEN for the combination of NFTAddress and TokenId
                    },
                },
                data: {
                    status: Status.PURCHASED,
                    buyer: {
                        connectOrCreate: {
                            where: {
                                address: buyer,
                            },
                            create: {
                                address: buyer,
                            },
                        },
                    },
                    sold: true,
                    purchasedAt: new Date(purchaseTimestamp.toString() * 1000),
                    purchasedBlockNumber: purchaseBlockNumber.toString(),
                },
            });
            console.log("Processed Listing Purchase");
        } catch (e) {
            console.log(e);
            if (e instanceof Prisma.RecordNotFound) {
                //if (e.code === "P2002") {
                console.log(
                    `Listing not found, there's no OPEN Listing for nftAddress: ${nftAddress}, tokenId: ${tokenId}. You should review PurchaseEvent with id: ${listingPurchasedEventId}`
                );
                //}
            } else {
                throw e;
            }
        }
    }

    async getActiveListingsByCollection(
        collectionAddress: string
    ): Promise<Listing[]> {
        try {
            return await client.listing.findMany({
                where: {
                    status: Status.OPEN,
                    nftAddress: collectionAddress,
                },
                select: {
                    id: true,
                    nftAddress: true,
                    tokenId: true,
                    seller: {
                        select: {
                            address: true,
                        },
                    },
                    price: true,
                    listedAt: true,
                },
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = ListingsDataAccess;
