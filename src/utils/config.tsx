export const supportedChains = [
    // For MVP will be used only Goerli network, others are commented for now
    // {
    //     id: 1,
    //     name: "Ethereum Mainnet",
    //     symbol: "ETH",
    //     nodeUrl: "https://1rpc.io/eth",
    //     explorerUrl: "https://etherscan.io"
    // },
    {
        id: 5,
        name: "Goerli",
        symbol: "ETH",
        nodeUrl: "https://rpc.ankr.com/eth_goerli",
        explorerUrl: "https://goerli.etherscan.io"
    }, 
    // {
    //     id: 137,
    //     name: "Polygon Mainnet",
    //     symbol: "MATIC",
    //     nodeUrl: "https://1rpc.io/matic",
    //     explorerUrl: "https://polygonscan.com"
    // }, {
    //     id: 42161,
    //     name: "Arbitrum One",
    //     symbol: "ETH",
    //     nodeUrl: "https://1rpc.io/arb",
    //     explorerUrl: "https://arbiscan.io"
    // }
]
export const walletConnectBridgeUrl = 'https://bridge.walletconnect.org'

export const libraryPollingInterval = 12000
export const nftpContractAddress = '0x25debaab06be555b861b97bde7682415961c1b58'
export const userRegistryContractAddress = '0xb22376D9fa05efFe958027236E873efD5eF6EA5D'
export const couponsContractAddress = '0xa90502454a9C18bD722bd400D1ABA8d571EDD804'

export const dialogsTimeout = 3000

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
