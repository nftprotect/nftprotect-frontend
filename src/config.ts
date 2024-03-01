import { Network } from "alchemy-sdk";
import { fallback, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const appName = "NFT Protect";
export const appDescription = "NFT Protect is an application that allows you to protect your NFTs and be sure of their safety without fear of theft.";
export const autoConnect = true;
export const appUrl = "https://dev.nftprotect.app";
export const appIcon = "https://dev.nftprotect.app/images/logo-blue.svg";

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
    //     couponsContractAddress: '0x6a204dDA156dafA6198A51241B21340627747402',
    //     defaultArbitrator: 1
    // }, 
    {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0xe7807e973f42aea32da71c15a6441760f675d9cc',
        userRegistryContractAddress: '0x727718859965b1c88c79491721d9b861654f6a73',
        arbRegistryContractAddress: '0xa8d82ab740b0ba1a1b5784b86ecdc41d53e4ff15',
        couponsContractAddress: '0x8f1cb013426f591220c51c516ac185a21405afa8',
        defaultArbitrator: 1,
        transport: fallback([
            http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
            http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
            http(), // public fallback
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
        //uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/Gfk3waJGQWZkYSjXEEzrRGxBKHD8s7SJ9UrkUtPQ2Qcv`
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1/v0.8.2'
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
                uri: 'https://api.studio.thegraph.com/proxy/17884/kleros-sepolia/version/latest/'
            }
        ]
    }
]

// Testnet
export const switchingManualURI = 'https://docs.nftprotect.app/guides/testnet-guidelines#switching-the-dispute-stage-in-kleros'