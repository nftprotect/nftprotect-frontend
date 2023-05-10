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
export const nftpContractAddress = '0xdccFE315E42c05c8699F3AC046b0A2F3115f4B02'
export const userRegistryContractAddress = '0xE2E809F3Aec329B8Af5482eB3B1AD6A90510e808'
export const arbitratorRegistryContractAddress = '0x6620883168AD86d3b88E0C1a3eF0b3Ce4284c17d'
export const couponsContractAddress = '0x03d8899BDad1F05F28373f04F05a0A9dC6BDad64'

export const dialogsTimeout = 5000

// IPFS
export const ipfsProviderUrl = 'https://ipfs.infura.io:5001/api/v0'
export const ipfsUrlMask = 'https://cloudflare-ipfs.com/ipfs/{HASH}/{FILENAME}'

// Arbitrators
export enum Arbitrators {
    Dummy,
    Kleros
}
export const defaultArbitrator = 1

// Kleros
export const klerosContractAddress = '0x78ac5F189FC6DAB261437a7B95D11cAcf0234FFe'

// The Graph
export const graphURI = 'https://api.thegraph.com/subgraphs/name/densmirnov/dyarbitr-subgraph'