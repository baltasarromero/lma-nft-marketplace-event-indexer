## Table of contents

  

- [General info](#general-info)

- [Technologies](#technologies)

- [Setup](#setup)

- [Pending](#pending)

  

## General info
This project is a node js event indexer targeted to the nft-marketplace implemented for the LimeAcademy Bootcamp see: [NFT Marketplace](https://github.com/baltasarromero/lma-nft-marketplacesimple)
  
This indexer listens and stores in a PostgreSQL database the following events:

- ListingCreated

- ListingCancelled

- Purchase

- NewNFTOffer

- NFTOfferCancelled

- NFTOfferCancelled

The indexer also keeps a record of each execution with the last block number processed for each event allowing to resume the listening/processing where the indexer left off last time.

Besides raw event tables and a record of the executions this app keeps a processed version of the Listing to be able to reflect it's current state based on the the raw events in order to simplify queries to serve the required APIs. The Listing table contains the processed data that reflects the state of a listing.

  

## Technologies
Project is created and validated with the following dependencies/versions:
  
- Node js v18.14.0

- Ethers v5.7.2

- Express JS v 4.18.2

- Prisma v4.11.0

- Prisma/client v4.11.0

  
Other Dependencies

- Dotenv v16.0.3

- Node-cron v3.0.2
  
## Setup
  
To setup this project, clone the repo and then install the dependencies using using npm:
```

cd ./lma-nft-marketplace-event-indexer

npm install

```
### Dependencies

Install a local database, this code was tested using Postgres SQL. So in order to run this Node Js application it will be necessary to have a Postgres DB available could be locally (either via docker image or installed) or remote. The connection to the database is done through an environment variable. See next section for configuration.

#### Configuration
Create an .env file in the root directory of the project with the following key/values

##### Database Configurations
```

DATABASE_URL="postgresql://{USER_NAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE_NAME}?schema={SCHEMA_NAME}"

```
##### Blockchain Configurations
```

ETHEREUM_NETWORK = {NETWORK-NAME} //The name of the network where the NFTMarketplace is deployed. NFT Marketplace is currently deployed in sepolia

INFURA_PROJECT_ID = {INFURA_PROJECT_ID} //Your Infura project ID

NFT_MARKETPLACE_CONTRACT_ADDRESS = {NFT_MARKETPLACE_CONTRACT_ADDRESS} // Currently sepolia address is 0x7401B735b57Ca565A44e1D17C132b7aB2f8a15a8

```
##### Scheduler Configuration

This is an example that will run the job every minute for more details on cron expressions see https://www.npmjs.com/package/node-cron

```

JOB_EXECUTION_CRON = * * * * *

```
##### API Configuration
Setup the following configuration var in the .env file the configure the API server
```
API_PORT = {API_SERVER_PORT}

```
#### Prisma

Once the database is available and the environment variable is properly set, run the following command in order to create the tables defined in

[prisma schema](prisma/schema.prisma)
 
Run prisma migrations

```

npx prisma migrate --dev

```

### How to start the indexer job

Once all the dependencies are complete we should run the following command to start the indexer job which will run based on the configuration defined in the above mentioned var "JOB_EXECUTION_CRON". If the variable is not set the indexer will run every minute by default.

```

npm run start-indexer-job

```
### Indexer API
The indexer API is built using [Express JS](https://expressjs.com/) it exposes the following API endpoints.



#### How to run the API

The following command starts the indexer API which will run based on the configuration defined in the above mentioned vars. If the variables are not set the API will run listen in localhost:3000 by default .

```
npm run start-indexer-job
```


#### Listings API
URL : http://{SERVER}:{PORT}/api/listings
##### Supported Query Parameters
Please notice that all query params are case-sensitive, any unknown query params will be ignored by the API. All three query params are optional. Take into account that some incompatible combinations of parameters might cause that the API don't return any results. It's up to the consumer to use the correct param combination.

**nftAddress**: This parameter is used to indicate the ethereum address of the NFT Collection that we are looking listings for.
**buyerAddress**: Ethereum address of the buyer of a given collection. Implicitly this means that the listings has a status = PURCHASED which means that if this param is combined with status = CANCELLED or OPEN it won't return any results.  
**status**: Available values are OPEN, CANCELLED and PURCHASED. The requested status determines if more fields are added to the response.

| Status       | Fields added     |
|--------------|-----------|
| OPEN | None      | 
| CANCELLED      | cancelledAt (DateTime)  |
| PURCHASED      | purchasedAt (DateTime) & buyer (id and address) |


Using the listings API it's possible to cover for the following use cases as well among others:

1. Fetching all active listings from a collection
	Use the following parameters: /api/listings?status=OPEN&nftAddress={NFT_COLLECTION_ADDRESS}
2. Fetching all active listings that are created from a specific user (address)
	Use the following parameters: /api/listings?status=OPEN&sellerAddress={NFT_SELLER_ADDRESS}
3. Fetching all purchase history of a specific user (address)
	Use the following parameters: api/listings?buyerAddress={NFT_BUYER_ADDRESS}

This approach was preferred over building a specific API endpoint for each requirement because it makes the API more generic, flexible and maintainable. Furthermore it is aligned with standard REST APIs. All these characteristics make it easier for others to integrate/consume these APIs.
Allowing more flexible APIs could lead to a large number of results (assuming a huge number of events is generated by the Marketplace) in this scenario pagination should the implemented to avoid affecting the server's performance and flooding the consumers with unmanageable responses.

Listings API response format depends on the status filter value.

When status filter is set to OPEN (searching for active listings)
```
{
    id: int, // Database id for the listing
    nftAddress: string,
    tokenId: string,
    seller: {
        id: int,
        address: string
    },
    price: int
    listingAt: DateTime  // time of listing event
}
```
When status filter is set to PURCHASED (Purchase history)
```
{
    id: int, // Database id for the listing
    nftAddress: string,
    tokenId: string,
    seller: {
         id: int,
         address: string
    },
    price: int,
    listingAt: DateTime,  // time of listing event
    purchasedAt: DateTime, // time of purchase
    buyer: {
        id: int,
        address: string
    }
}
```
When status filter is set to CANCELLED 
```
{
    id: int, // Database id for the listing
    nftAddress: string,
    tokenId: string,
    seller: {
         id: int,
         address: string
    },
    price: int,
    listingAt: DateTime,  // time of listing event
    cancelledAt: DateTime, // time of cancelling
}

When status filter is NOT set listings with any status is returned and the response inclused all avobe mentioned attributes
```
{
    id: int, // Database id for the listing
    nftAddress: string,
    tokenId: string,
    seller: {
         id: int,
         address: string
    },
    price: int,
    listingAt: DateTime,  // time of listing event
    purchasedAt: DateTime, // time of purchase
    buyer: {
        id: int,
        address: string
    },
    cancelledAt: DateTime, // time of cancelling
}
#### Collections Stats API
URL : http://{SERVER}:{PORT}/api/collections/stats

This API returns stats for the requested collection. Supported stats are:
**FloorPrice** Lowest price for currently Active listings 
**TradedVolume** Sum of amount (in wei) of all the NFTs from the requested collection that were traded in the Marketplace.
##### Supported Query Parameters
**nftAddress**: This parameter is used to indicate the ethereum address of the NFT Collection that we want to retrieve stats from.

#### Offers API
Documentation Pending
## Pending

- Pagination support
- Throttling to avoid DOS attacks