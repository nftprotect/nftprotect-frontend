import { Network } from "alchemy-sdk";
import { mainnet, goerli, sepolia } from "wagmi/chains";

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
        wagmiId: goerli,
        name: "Goerli",
        symbol: "ETH",
        explorerUrl: "https://goerli.etherscan.io",
        nftpContractAddress: '0x5aDf8b955011a09726CbAB8d43622ac1B2fB344F',
        userRegistryContractAddress: '0x9B80f551E8f416b54EA9d71AF5acE49aA0609aAC',
        arbRegistryContractAddress: '0x6b61f0a88C4A2CfeF2b9f948093C95531a6B9F04',
        couponsContractAddress: '0x3D9D532351C473C476b1077D1770f373B5f1AAc4',
        defaultArbitrator: 2
    }, {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0xB1A382a0946528cAc1Bde3f419B69809CC347613',
        userRegistryContractAddress: '0x49ba52fe9dF9e55BeF56BE7D0F19eF8b645D51F3',
        arbRegistryContractAddress: '0x0cEC9a8A65A5d9D0e39fa9B26e5F9dE3FDC4D7fb',
        couponsContractAddress: '0x8c743B717e960fa00779b7b148D63a59009E9c9d',
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

// IPFS
export const ipfsProviderUrl = 'https://ipfs.infura.io:5001/api/v0'
export const ipfsUrlMask = 'https://cloudflare-ipfs.com/ipfs/{HASH}/{FILENAME}'

// Coinmarketcap
export const coinmarketcapUrl = 'https://pro-api.coinmarketcap.com/v1'

// Kleros
export const klerosContractAddress = '0x78ac5F189FC6DAB261437a7B95D11cAcf0234FFe'

// The Graph
// ChainId: URI

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

// Testnet
export const switchingManualURI = 'https://docs.nftprotect.app/guides/testnet-guidelines#switching-the-dispute-stage-in-kleros'