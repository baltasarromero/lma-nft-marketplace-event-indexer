//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { OfferStatus, Listing } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/index";
import { BigNumber } from "ethers";

class NFTOfferDataAccess {
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

    /* async getFloorPrice(collectionAddress: string): Promise<Decimal> {
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
 */
 /*    async getTradedVolume(collectionAddress: string): Promise<Decimal> {
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
    } */

    // Write
    async saveNFTOffer(
        offerCreatedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        seller: string,
        buyer: string,
        offer: BigNumber,
        offerCreatedTimestamp: any,
        offerCreatedBlockNumber: BigNumber
    ) {
        try {
            await client.nFTOffer.create({
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
                    offeredPrice: offer.toString(),
                    offerCreatedAt: new Date(offerCreatedTimestamp.toString() * 1000),
                    offerCreatedBlockNumber: offerCreatedBlockNumber.toString(),
                },
            });
            console.log("Saved new processed NFTOffer");
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        `Unique constraint violation, NFTOffer for nftAddress: ${nftAddress}, tokenId: ${tokenId}, seller ${seller}, buyer ${buyer} and offer created timestamp: ${offerCreatedTimestamp} is already saved. You should review NFTOfferCreatedEvent with id: ${offerCreatedEventId}`
                    );
                }
            } else {
                console.log(e);
                throw e;
            }
        }
    }

    // The assumption is that there must be one and only one NFTOffer OPEN for the combination of NFTAddress, TokenId and Buyer
    async cancelNFTOffer(
        offerCancelledEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        buyer: string,
        cancelTimestamp: any,
        cancelBlockNumber: BigNumber
    ) {
        try {
            console.log("Cancelling NFTOffer");
            // TODO This is a tradeoff to reduce implementation time
            // Should use a raw query to avoid running two queries
            const buyerRecord = await client.user.findUnique({
                where: {
                    address: buyer
                },
                select: {
                    id: true
                }
            });

            await client.nFTOffer.update({
                where: {
                    nftAddress_tokenId_buyerId_status: {   
                        nftAddress: nftAddress,
                        tokenId: tokenId.toString(),
                        buyerId: buyerRecord.id,
                        status: OfferStatus.OPEN,     
                    }      
                },
                data: {
                    status: OfferStatus.CANCELLED,
                    cancelledAt: new Date(cancelTimestamp.toString() * 1000),
                    cancelledBlockNumber: cancelBlockNumber.toString(),
                },
            });
            console.log("Processed NFTOffer Cancellation");
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    console.log(
                        `NFTOffer not found, there's no OPEN NFTOffer for nftAddress: ${nftAddress}, tokenId: ${tokenId} and buyer ${buyer}. You should review NFTOfferCancelledEvent with id: ${offerCancelledEventId}`
                    );
                }
            } else {
                console.log(e);
                throw e;
            }
        }
    }

       // The assumption is that there must be one and only one NFTOffer OPEN for the combination of NFTAddress, TokenId and Buyer
       async acceptNFTOffer(
        offerAcceptedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        buyer: string,
        acceptedTimestamp: any,
        acceptedBlockNumber: BigNumber
    ) {
        try {
            console.log("Accepting NFTOffer");
            // TODO This is a tradeoff to reduce implementation time
            // Should use a raw query to avoid running two queries
            const buyerRecord = await client.user.findUnique({
                where: {
                    address: buyer
                },
                select: {
                    id: true
                }
            });

            await client.nFTOffer.update({
                where: {
                    nftAddress_tokenId_buyerId_status: {   
                        nftAddress: nftAddress,
                        tokenId: tokenId.toString(),
                        buyerId: buyerRecord.id,
                        status: OfferStatus.OPEN,     
                    }      
                },
                data: {
                    status: OfferStatus.ACCEPTED,
                    sold: true,
                    acceptedAt: new Date(acceptedTimestamp.toString() * 1000),
                    acceptedBlockNumber: acceptedBlockNumber.toString(),
                },
            });
            console.log("Processed NFTOffer Acceptance");
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2025") {
                    console.log(
                        `NFTOffer not found, there's no OPEN NFTOffer for nftAddress: ${nftAddress}, tokenId: ${tokenId} and buyer ${buyer}. You should review NFTOfferAcceptedEvent with id: ${offerAcceptedEventId}`
                    );
                }
            } else {
                console.log(e);
                throw e;
            }
        }
    }
}

module.exports = NFTOfferDataAccess;
