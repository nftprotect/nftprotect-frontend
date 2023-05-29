import { Network } from "alchemy-sdk"

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
    {
        id: 5,
        alchemyId: Network.ETH_GOERLI,
        name: "Goerli",
        symbol: "ETH",
        nodeUrl: "https://rpc.ankr.com/eth_goerli",
        explorerUrl: "https://goerli.etherscan.io"
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
export const defaultChain = 5 // Goerli
export const walletConnectBridgeUrl = 'https://bridge.walletconnect.org'

export const libraryPollingInterval = 12000
export const nftpContractAddress = '0xf837fB19Ffd6c87700fb98743F29acCa43454299'
export const userRegistryContractAddress = '0xcAD5C3a950667EEa1E9E7eAb92dFdB56502792aD'
export const dynamicArbRegistryContractAddress = '0x6620883168AD86d3b88E0C1a3eF0b3Ce4284c17d'
export const couponsContractAddress = '0x5512F1beb7078329c6f437E03ff845243B8b6179'

export const dialogsTimeout = 5000

// IPFS
export const ipfsProviderUrl = 'https://ipfs.infura.io:5001/api/v0'
export const ipfsUrlMask = 'https://cloudflare-ipfs.com/ipfs/{HASH}/{FILENAME}'

// Arbitrators
export enum Arbitrators {
    Dummy,
    Kleros
}
export const defaultArbitrator = 2

// Kleros
export const klerosContractAddress = '0x78ac5F189FC6DAB261437a7B95D11cAcf0234FFe'

// The Graph
// ChainId: URI
export const dynamicArbRegistryGraphs = {
    5: 'https://api.thegraph.com/subgraphs/name/densmirnov/dyarbitr-subgraph'
}

export const nftProtectGraphs = {
    5: 'https://api.thegraph.com/subgraphs/name/densmirnov/nftprotect'
}

export const arbitratorGraphs = {
    5: { // ChainID
        2: 'https://api.thegraph.com/subgraphs/name/densmirnov/nftprotect' // ArbitratorID
    }
}