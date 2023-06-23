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
export const maxBlocksPerRequest = 3000

export const libraryPollingInterval = 12000
export const nftpContractAddress = '0x5aDf8b955011a09726CbAB8d43622ac1B2fB344F'
export const userRegistryContractAddress = '0x9B80f551E8f416b54EA9d71AF5acE49aA0609aAC'
export const arbRegistryContractAddress = '0x6b61f0a88C4A2CfeF2b9f948093C95531a6B9F04'
export const dynamicArbRegistryContractAddress = '0x6620883168AD86d3b88E0C1a3eF0b3Ce4284c17d'
export const couponsContractAddress = '0x3D9D532351C473C476b1077D1770f373B5f1AAc4'
export const nftpDeployBlockNumber = 9073902

export const dialogsTimeout = 5000

// IPFS
export const ipfsProviderUrl = 'https://ipfs.infura.io:5001/api/v0'
export const ipfsUrlMask = 'https://cloudflare-ipfs.com/ipfs/{HASH}/{FILENAME}'

// Coinmarketcap
export const coinmarketcapUrl = 'https://pro-api.coinmarketcap.com/v1'

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
export const dynamicArbRegistryGraphs = [
    {
        chainId: 5,
        uri: 'https://api.thegraph.com/subgraphs/name/densmirnov/dyarbitr-subgraph'
    }
]

export const nftProtectGraphs = [
    {
        chainId: 5,
        uri: 'https://api.thegraph.com/subgraphs/name/densmirnov/nftprotect'
    }
]

export const arbitratorGraphs = [
    {
        chainId: 5,
        arbitrators: [
            {
                arbitratorId: 5,
                uri: 'https://api.thegraph.com/subgraphs/name/densmirnov/klerosboard'
            }
        ]
    }
]