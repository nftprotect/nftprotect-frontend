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
export const nftpContractAddress = '0x0f89a90ca6b0e193bd1beb6cef24da76d4434d77'
export const userRegistryContractAddress = '0x6062b6588955e25a2d09292ccfe1a28b49f3b4e1'
export const arbitratorRegistryContractAddress = '0x86D5b96E35369210e9948b422Fd7006B8C1110a9'
export const couponsContractAddress = '0x479213ab22d41999DF143aDBce000831b9B7C736'

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