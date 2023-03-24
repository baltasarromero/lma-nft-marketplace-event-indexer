require('dotenv').config();

const { ethers } = require("ethers");

const NFTMarketplaceArtifact = require("../../artifacts/NFTMarketplace.sol/NFTMarketplace.json");

const provider = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
);

const nftMarketplaceContract = new ethers.Contract(process.env.NFT_MARKETPLACE_CONTRACT_ADDRESS, NFTMarketplaceArtifact.abi, provider);    

const ethereumConfig = {
    network: process.env.ETHEREUM_NETWORK,
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    nftMarketplaceAddress: process.env.NFT_MARKETPLACE_CONTRACT_ADDRESS,
    provider: provider,
    nftContract: nftMarketplaceContract
}

module.exports = ethereumConfig;