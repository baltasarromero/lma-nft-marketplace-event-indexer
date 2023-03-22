import dotenv from 'dotenv';
dotenv.config();

const { ethers } = require("ethers");
import { InfuraProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
const NFTMarketplaceArtifact = require("../artifacts/NFTMarketplace.sol/NFTMarketplace.json");


let nftContract: Contract;
let provider: InfuraProvider;

async function setProvider() {
    provider = new ethers.providers.InfuraProvider(
        process.env.ETHEREUM_NETWORK,
        process.env.INFURA_PROJECT_ID
    );
}

async function getNFTMarketplaceEvents() {
    await setProvider();

    nftContract = new ethers.Contract("0x0681F44AADF8FA1eA9aC001cF0AB688266c68985", NFTMarketplaceArtifact.abi, provider);

    console.log(`Getting the nft marketplace events events...`);
    const currentBlock = await provider.getBlockNumber();

    let listingCreatedEventFilter = nftContract.filters.ListingCreated();
    let events = await nftContract.queryFilter(listingCreatedEventFilter, 0, currentBlock);
  
    console.log(events);
}


async function main () {
    await getNFTMarketplaceEvents();
}

main();
