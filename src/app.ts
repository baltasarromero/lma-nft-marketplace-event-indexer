import dotenv from 'dotenv';
dotenv.config();

const { ethers } = require("ethers");
import { InfuraProvider } from "@ethersproject/providers";
import { Contract, Event, EventFilter } from "@ethersproject/contracts";
const NFTMarketplaceArtifact = require("../artifacts/NFTMarketplace.sol/NFTMarketplace.json");


let nftContract: Contract;
let provider: InfuraProvider;

function setup() {
    // Configure provider
    provider = new ethers.providers.InfuraProvider(
        process.env.ETHEREUM_NETWORK,
        process.env.INFURA_PROJECT_ID
    );

    // Configure contract
    nftContract = new ethers.Contract(process.env.NFT_MARKETPLACE_CONTRACT_ADDRESS, NFTMarketplaceArtifact.abi, provider);
}

async function getCreatedListingEvents(): Promise<Array<Event>> {
    console.log(`Getting the nft marketplace events events...`);
    const currentBlock = await provider.getBlockNumber();

    let listingCreatedEventFilter: EventFilter = nftContract.filters.ListingCreated();
    let events: Array<Event>;
    events = await nftContract.queryFilter(listingCreatedEventFilter, 0, currentBlock);
  
    return events;
}


async function main () {
    setup();
    console.log(await getCreatedListingEvents());
}

main();
