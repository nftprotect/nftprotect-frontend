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
        nftpContractAddress: '0x27b6e64bf6faec53141f2a2cd2da55dc1dffa5ba',
        userRegistryContractAddress: '0xf557231b2e3b088e9b8cb1072c0ce03898975c6a',
        arbRegistryContractAddress: '0xb8ef2a8ca0be3f5d734446cd6a13f56372a56e2b',
        signatureVerifierContractAddress: '0x63473816e94ad6c2c8b9ec496957b900b818faf9',
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
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1/v0.9.7'
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