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
    // For MVP will be used only Goerli network, others are commented for now
    // {
    //     id: 1,
    //     alchemyId: Network.ETH_MAINNET,
    //     name: "Ethereum Mainnet",
    //     symbol: "ETH",
    //     nodeUrl: "https://1rpc.io/eth",
    //     explorerUrl: "https://etherscan.io"
    // },
    // {
    //     id: 5,
    //     alchemyId: Network.ETH_GOERLI,
    //     wagmiId: goerli,
    //     name: "Goerli",
    //     symbol: "ETH",
    //     explorerUrl: "https://goerli.etherscan.io",
    //     nftpContractAddress: '0x8732b75a23fefab3be8825ae87dffcb38760121f',
    //     userRegistryContractAddress: '0x68deab39fb68a7c24d67d16b1f133809c41c008f',
    //     arbRegistryContractAddress: '0x094c049f25d6ea178b3262887d37ad9da36b2355',
    //     defaultArbitrator: 1
    // }, 
    {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0x2227b944f06304c0f6b42ae18067af6dee148573',
        userRegistryContractAddress: '0xc4f9fc0f8fe6a2dc9f66b387be0c741750f196cf',
        arbRegistryContractAddress: '0x25bf41c8f7ea92091260c9e50bb44566a0719bd7',
        signatureVerifierContractAddress: '0xffcf59f89debd62c5821bcdea945382657ca3760',
        defaultArbitrator: 1,
        transport: fallback([
            webSocket(`wss://sepolia.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
            webSocket(`wss://eth-sepolia.ws.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
            // http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
            // http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
        ]),
    },
    // {
    //     id: 137,
    //     alchemyId: Network.MATIC_MAINNET,
    //     name: "Polygon Mainnet",
    //     symbol: "MATIC",
    //     nodeUrl: "https://1rpc.io/matic",
    //     explorerUrl: "https://polygonscan.com"
    // }, {
    //     id: 42161,
    //     alchemyId: Network.ARB_MAINNET,
    //     name: "Arbitrum One",
    //     symbol: "ETH",
    //     nodeUrl: "https://1rpc.io/arb",
    //     explorerUrl: "https://arbiscan.io"
    // }
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
    // {
    //     chainId: 5,
    //     uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1-goerli/v0.5'
    // }, 
    {
        chainId: 11155111,
        //uri: `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Gfk3waJGQWZkYSjXEEzrRGxBKHD8s7SJ9UrkUtPQ2Qcv`
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1/v0.9.5'
    }
]

export const arbitratorGraphs = [
    // {
    //     chainId: 5,
    //     arbitrators: [
    //         {
    //             arbitratorId: 2,
    //             uri: 'https://api.thegraph.com/subgraphs/name/densmirnov/klerosboard'
    //         }
    //     ]
    // },
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

// Testnet
export const switchingManualURI = 'https://docs.nftprotect.app/guides/testnet-guidelines#switching-the-dispute-stage-in-kleros'