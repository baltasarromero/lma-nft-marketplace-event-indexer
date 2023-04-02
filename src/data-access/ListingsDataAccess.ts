//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { Status, Listing } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/index";
import { BigNumber } from "ethers";

class ListingsDataAccess {
    // Helper function to generate dynamic where clause
    // We need specific logic for the buyerAddress param because it's a nested relationship, all parameter that are nested relationship
    // will require similar treatment. The rest of the parameters can be added to the where clause directly
    generateWhereClause(filters: Map<String, any>): Object {
        let where = {};

        for (let [key, value] of Object.entries(filters)) {
            switch (key) {
                case "buyerAddress": {
                    where["buyer"] = {
                        address: value,
                    };
                    break;
                }
                case "sellerAddress": {
                    where["seller"] = {
                        address: value,
                    };
                    break;
                }
                default: {
                    where[key] = value;
                    break;
                }
            }
        }

        return where;
    }

    // Helper function to dynamically add attributes to select clause based on the requested Listing status
    // Depending on the status requested more fields will be added to the select clause. i.e. if CANCELLED status
    // is requested the cancelledAt field will be added if PURCHASED status is requested the purchasedAt and buyer fields will be
    // added to the select clause. In case  no specific status is used for filtering all related fields will be included
    generateSelectClause(status: string): Object {
        let select = {
            id: true,
            nftAddress: true,
            tokenId: true,
            seller: {
                select: {
                    id: true,
                    address: true,
                },
            },
            price: true,
            listedAt: true,
            ...(status == null || status == "PURCHASED"
                ? {
                      buyer: {
                          select: { id: true, address: true },
                      },
                      purchasedAt: true,
                  }
                : {}),
            ...(status == null || status == "CANCELLED"
                ? { cancelledAt: true }
                : {}),
        };

        return select;
    }

    // Read
    async getListingById(id: number): Promise<Listing> {
        try {
            return await client.listing.findUnique({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    nftAddress: true,
                    tokenId: true,
                    seller: {
                        select: {
                            id: true,
                            address: true,
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            address: true,
                        },
                    },
                    price: true,
                    sold: true,
                    status: true,
                    listedAt: true,
                    listedBlockNumber: true,
                    cancelledAt: true,
                    cancelledBlockNumber: true,
                    purchasedAt: true,
                    purchasedBlockNumber: true,
                },
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async searchListings(queryParams: Map<String, any>): Promise<Listing[]> {
        try {
            const where = this.generateWhereClause(queryParams);
            const select = this.generateSelectClause(queryParams["status"]);

            return await client.listing.findMany({
                where,
                select,
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getFloorPrice(collectionAddress: string): Promise<Decimal> {
        let floorPriceStat: Object[];

        try {
            // Floor price
            floorPriceStat = await client.listing.groupBy({
                by: ["nftAddress"],
                where: {
                    nftAddress: collectionAddress,
                    status: Status.OPEN,
                },
                _min: {
                    price: true,
                },
            });

            // Given we are grouping by nftAddress the result of the query only has  one record
            return floorPriceStat[0]? floorPriceStat[0]["_min"]["price"] : 0;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getTradedVolume(collectionAddress: string): Promise<Decimal> {
        let tradedVolumeStat: Object[];

        try {
            // Traded Volume
            tradedVolumeStat = await client.listing.groupBy({
                by: ["nftAddress"],
                where: {
                    nftAddress: collectionAddress,
                    status: Status.PURCHASED,
                },
                _sum: {
                    price: true,
                }
            });

            // Given we are grouping by nftAddress the result of the query only has  one record
            return tradedVolumeStat[0]? tradedVolumeStat[0]["_sum"]["price"] : 0;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    // Write
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
                console.log(e);
                throw e;
            }
        }
    }

    // The assumption is that there must be one and only one Listing OPEN for the combination of NFTAddress and TokenId
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
                        status: Status.OPEN,
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
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    console.log(
                        `Listing not found, there's no OPEN Listing for nftAddress: ${nftAddress} and tokenId: ${tokenId}. You should review CancelledListingEvent with id: ${listingCancelledEventId}`
                    );
                }
            } else {
                console.log(e);
                throw e;
            }
        }
    }

    // The assumption is that there must be one and only one Listing OPEN for the combination of NFTAddress and TokenId
    async purchaseListing(
        listingPurchasedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        buyer: string,
        purchaseTimestamp: any,
        purchaseBlockNumber: BigNumber
    ) {
        try {
            await client.listing.update({
                where: {
                    nftAddress_tokenId_status: {
                        nftAddress: nftAddress,
                        tokenId: tokenId.toString(),
                        status: Status.OPEN,
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
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    console.log(
                        `Listing not found, there's no OPEN Listing for nftAddress: ${nftAddress} and tokenId: ${tokenId}. You should review PurchaseEvent with id: ${listingPurchasedEventId}`
                    );
                }
            } else {
                console.log(e);
                throw e;
            }
        }
    }
}

module.exports = ListingsDataAccess;
