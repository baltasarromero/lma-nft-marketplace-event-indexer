//Data Access Layer
const { PrismaClient, Prisma } = require("@prisma/client");
const client = new PrismaClient();

import { OfferStatus, NFTOffer } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/index";
import { BigNumber } from "ethers";

class NFTOfferDataAccess {
    // Helper function to generate dynamic where clause
    generateWhereClause(filters: Map<String, any>): Object {
        let where = {};

        for (let [key, value] of Object.entries(filters)) {
            where[key] = value;
        }

        return where;
    }

    // Helper function to dynamically add attributes to select clause based on the requested NFTOffer status
    // Depending on the status requested more fields will be added to the select clause. i.e. if CANCELLED status
    // is requested the cancelledAt field will be added if ACCEPTED status is requested the acceptedAt field will be
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
            buyer: {
                select: {
                    id: true,
                    address: true,
                },
            },
            offeredPrice: true,
            sold: true,
            status: true,
            offerCreatedAt: true,
            ...(status == null || status == "CANCELLED"
                ? { cancelledAt: true }
                : {}),
            ...(status == null || status == "ACCEPTED"
            ? {
                acceptedAt: true,
                }
            : {}),
        };

        return select;
    }

    // Read
    async getNFTOfferById(id: number): Promise<NFTOffer> {
        try {
            return await client.nFTOffer.findUnique({
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
                    offeredPrice: true,
                    sold: true,
                    status: true,
                    offerCreatedAt: true,
                    offerCreatedBlockNumber: true,
                    cancelledAt: true,
                    cancelledBlockNumber: true,
                    acceptedAt: true,
                    acceptedBlockNumber: true,
                },
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async searchNFTOffers(queryParams: Map<String, any>): Promise<NFTOffer[]> {
        try {
            const where = this.generateWhereClause(queryParams);
            const select = this.generateSelectClause(queryParams["status"]);

            return await client.nFTOffer.findMany({
                where,
                select,
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getBestOffer(collectionAddress: string): Promise<Decimal> {
        let bestOfferStat: Object[];

        try {
            // Best Offer
            bestOfferStat = await client.nFTOffer.groupBy({
                by: ["nftAddress"],
                where: {
                    nftAddress: collectionAddress,
                    status: OfferStatus.OPEN,
                },
                _max: {
                    offeredPrice: true,
                }
            });

            // Given we are grouping by nftAddress the result of the query only has  one record
            return bestOfferStat[0]? bestOfferStat[0]["_max"]["offeredPrice"] : 0;
        } catch (e) {
            console.log(e);
            throw e;
        }
    } 

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
                console.log(e); 
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
        seller: string,
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

            const sellerRecord = await client.user.findUnique({
                where: {
                    address: seller
                },
                select: {
                    id: true
                }
            });

            const openOffers = await client.nFTOffer.findMany({
                where: {
                    nftAddress: nftAddress,
                    tokenId: tokenId.toString(),
                    sellerId: sellerRecord.id,
                    buyerId: buyerRecord.id,
                    status: OfferStatus.OPEN,     
                    offerCreatedAt: {
                        lt: new Date(cancelTimestamp.toString() * 1000)
                    }
                },
                orderBy: {
                    offerCreatedAt: 'asc',
                },
                take: 1
            });

            if (openOffers[0] != null ) {
                await client.nFTOffer.update({
                    where: {
                        id: openOffers[0].id
                    },
                    data: {
                        status: OfferStatus.CANCELLED,
                        cancelledAt: new Date(cancelTimestamp.toString() * 1000),
                        cancelledBlockNumber: cancelBlockNumber.toString(),
                    },
                });
                console.log("Processed NFTOffer Cancellation");
            } {
                console.log(
                    `NFTOffer not found, there's no OPEN NFTOffer for nftAddress: ${nftAddress}, tokenId: ${tokenId} and buyer ${buyer}. You should review NFTOfferCancelledEvent with id: ${offerCancelledEventId}`
                );
            }
          
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

    async acceptNFTOffer(
        offerAcceptedEventId: number,
        nftAddress: string,
        tokenId: BigNumber,
        seller: string,
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

            const sellerRecord = await client.user.findUnique({
                where: {
                    address: seller
                },
                select: {
                    id: true
                }
            });

            const openOffers = await client.nFTOffer.findMany({
                where: {
                    nftAddress: nftAddress,
                    tokenId: tokenId.toString(),
                    sellerId: sellerRecord.id,
                    buyerId: buyerRecord.id,
                    status: OfferStatus.OPEN,     
                    offerCreatedAt: {
                        lt: new Date(acceptedTimestamp.toString() * 1000)
                    }
                },
                orderBy: {
                    offerCreatedAt: 'asc',
                },
                take: 1
            });

            if (openOffers[0] != null ) {
                await client.nFTOffer.update({
                    where: {
                        id: openOffers[0].id
                    },
                    data: {
                        status: OfferStatus.ACCEPTED,
                        sold: true,
                        cancelledAt: new Date(acceptedTimestamp.toString() * 1000),
                        cancelledBlockNumber: acceptedBlockNumber.toString(),
                    },
                });
                console.log("Processed NFTOffer Acceptance");
            } {
                console.log(
                    `NFTOffer not found, there's no OPEN NFTOffer for nftAddress: ${nftAddress}, tokenId: ${tokenId} and buyer ${buyer}. You should review NFTOfferAcceptedEvent with id: ${offerAcceptedEventId}`
                );
            }
          
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
