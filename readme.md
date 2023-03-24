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

The indexer also keeps a record of each execution with the last block number processed for each event allowing to resume the listening/processing where the indexer left off last time.

Besides raw event tables and a record of the executions this app keeps a processed version of the Listing to be able to reflect it's current state based on the the raw events in order to simplify queries to serve the required APIs. The Listing table contains the processed data that reflects the state of a listing.

## Technologies

Project is created and validated with the following dependencies/versions:

- Node js v18.14.0
- Ethers v5.7.2
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
Install a local database, this code was tested using Postgres SQL. So in order to run this Node Js application it wil be necessary to have a Postgres DB available could be locally (either via docker image or installed) or remote. The connection to the database is done through an environent variable. See next section for configuration.


### Configuration
Create an .env file in the root directory of the project with the following key/values

### Database Configurations
```
DATABASE_URL="postgresql://{USER_NAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE_NAME}?schema={SCHEMA_NAME}"
```
### Blockchain Configurations
```
ETHEREUM_NETWORK = {NETWORK-NAME} //The name of the network where the NFTMarketplace is deployed. NFT Marketplace is currently deployed  in sepolia
INFURA_PROJECT_ID = {INFURA_PROJECT_ID} //Your Infura project ID
NFT_MARKETPLACE_CONTRACT_ADDRESS = {NFT_MARKETPLACE_CONTRACT_ADDRESS} // Currently sepolia address is 0x0681F44AADF8FA1eA9aC001cF0AB688266c68985
```
### Scheduler Configuration
This is an example that will run the job every minute for more details on cron expressions see https://www.npmjs.com/package/node-cron
```
JOB_EXECUTION_CRON = * * * * * 
```
### Prisma
Once the database is available and the environment variable is properly set, run the following command in order to create the tables defined in 
[prisma schema](prisma/schema.prisma)

Run prisma migrations
```
npx prisma migrate --dev
```
## How to start the indexer job
The following command starts the indexer job which will run based on the configuration defined in the above mentioned var "JOB_EXECUTION_CRON"
```
npm run start-indexer-job
```
## Pending
Implement logic to process raw events and reflect consolidated listing state in order to support queries from an API.