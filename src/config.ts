import { Network } from "alchemy-sdk";
import { fallback, http, webSocket } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const appName = "NFT Protect";
export const appDescription = "NFT Protect is an application that allows you to protect your NFTs and be sure of their safety without fear of theft.";
export const appUrl = "https://dev.nftprotect.app";
export const appIcon = "https://dev.nftprotect.app/images/logo-blue.svg";
// This text must match the text in SignatureVerifier.sol
export const signingText = `WARNING! READ CAREFULLY!\nBy signing this message, you agree to withdraw your original NFT from the NFT Protect protocol. Access to it will no longer be recoverable through NFT Protect!\n`;

// IPFS gateways to use with Wagmi (e.g. ENS avatar resolving)
export const wagmiGatewayUrls = ['https://cloudflare-ipfs.com']

export const supportedChains = [
    {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0x35be7e7dedc7ae13bd80ec8d26cf80ab2f7f0934',
        userRegistryContractAddress: '0x6307453103337b65636b221b4404d302539c99d5',
        arbRegistryContractAddress: '0x25bf41c8f7ea92091260c9e50bb44566a0719bd7',
        signatureVerifierContractAddress: '0xffcf59f89debd62c5821bcdea945382657ca3760',
        defaultArbitrator: 1,
        transport: fallback([
            webSocket(`wss://sepolia.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
            webSocket(`wss://eth-sepolia.ws.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
        ])
    }
]

export const defaultChain = 11155111 // Sepolia
export const maxBlocksPerRequest = 1000000 // use 3000 for public providers

// IPFS
export const ipfsProviderUrl = 'https://ipfs.infura.io:5001/api/v0'
export const ipfsUrlMask = 'https://cloudflare-ipfs.com/ipfs/{HASH}/{FILENAME}'

// Coinmarketcap
export const coinmarketcapUrl = 'https://pro-api.coinmarketcap.com/v1'

// The Graph
// ChainId: URI

export const nftProtectGraphs = [
    {
        chainId: 11155111,
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1/v0.9.6'
    }
]

export const arbitratorGraphs = [
    {
        chainId: 11155111,
        arbitrators: [
            {
                arbitratorId: 1,
                uri: 'https://api.studio.thegraph.com/query/50822/kleros-v1/v1.0'
            }
        ]
    }
]

// NFT Marketplaces
export const nftMarketplaces = {
    testnet: {
        opensea: "https://testnets.opensea.io/",
        rarible: "https://testnet.rarible.com/",
        blur: "https://blur.io/"
    }, 
    mainnet: {
        opensea: "https://opensea.io/",
        rarible: "https://rarible.com/",
        blur: "https://blur.io/"
    }
}

// Testnet
export const switchingManualURI = 'https://docs.nftprotect.app/guides/testnet-guidelines#switching-the-dispute-stage-in-kleros'