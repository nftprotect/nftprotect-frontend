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
        nftpContractAddress: '0x8732b75a23fefab3be8825ae87dffcb38760121f',
        userRegistryContractAddress: '0x68deab39fb68a7c24d67d16b1f133809c41c008f',
        arbRegistryContractAddress: '0x094c049f25d6ea178b3262887d37ad9da36b2355',
        couponsContractAddress: '0x6a204dDA156dafA6198A51241B21340627747402',
        defaultArbitrator: 1
    }, {
        id: 11155111,
        alchemyId: Network.ETH_SEPOLIA,
        wagmiId: sepolia,
        name: "Sepolia",
        symbol: "ETH",
        explorerUrl: "https://sepolia.etherscan.io",
        nftpContractAddress: '0x9e652f34a8063de3627574da29c7e9baf5bb8a7d',
        userRegistryContractAddress: '0xc3dc0e74c92043a2712ce22f385f7b3d390bb695',
        arbRegistryContractAddress: '0x423f42f53f67356e7bc9093410303c68c8478fe7',
        couponsContractAddress: '0x142724c5bFcd293C9eFcD27Ee306Bb3Cc8bF15CD',
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
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1-goerli/v0.5'
    }, {
        chainId: 11155111,
        uri: 'https://api.studio.thegraph.com/query/50822/nftprotect-v1/v0.5'
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