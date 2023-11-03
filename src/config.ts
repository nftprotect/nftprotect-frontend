import { Network } from "alchemy-sdk";
import { mainnet, goerli, sepolia } from "wagmi/chains";

export const supportedChains = [
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
    //     nftpContractAddress: '0x5aDf8b955011a09726CbAB8d43622ac1B2fB344F',
    //     userRegistryContractAddress: '0x9B80f551E8f416b54EA9d71AF5acE49aA0609aAC',
    //     arbRegistryContractAddress: '0x6b61f0a88C4A2CfeF2b9f948093C95531a6B9F04',
    //     dynamicArbRegistryContractAddress: '0x6620883168AD86d3b88E0C1a3eF0b3Ce4284c17d',
    //     couponsContractAddress: '0x3D9D532351C473C476b1077D1770f373B5f1AAc4',
    //     defaultArbitrator: 2
    // }, 
    {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0xAcb24C39a77c8888B6f1f4525039A295D4FE8B12',
        userRegistryContractAddress: '0xF4Af59de41953805D8B6dA8048f9c7f84F5604ae',
        arbRegistryContractAddress: '0x6b5f8057679F6F35Efd1Ffb9EE90cF71f900bC38',
        couponsContractAddress: '0x6557a4f0b19FEf7D5B2164cD3004eF41C5f7b16B',
        requestHubContractAddress: '0x1FA25ed3969478e5e21f74733c2c6f92d17aF940',
        defaultArbitrator: 1
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
export const maxBlocksPerRequest = 1000000 // use 3000 for public providers

export const nftpDeployBlockNumber = 9073902

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
    }, {
        chainId: 11155111,
        uri: 'https://api.studio.thegraph.com/proxy/17884/nftprotect-sepolia/version/latest'
    }
]

export const arbitratorGraphs = [
    {
        chainId: 5,
        arbitrators: [
            {
                arbitratorId: 2,
                uri: 'https://api.thegraph.com/subgraphs/name/densmirnov/klerosboard'
            }
        ]
    },
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

export const simpleMinters = [
    {
        chainId: 5,
        contracts: {
            ERC721: '',
            ERC1155: ''
        }
    }, {
        chainId: 11155111,
        contracts: {
            ERC721: '0x81130a8a3ee226a735Cd0E153305054a9fdE721F',
            ERC1155: '0x6DF767f2bc19e8C0DA48aBFAA247aA08636f21C5'
        }
    }
]

// Testnet
export const switchingManualURI = 'https://docs.nftprotect.app/guides/testnet-guidelines#switching-the-dispute-stage-in-kleros'