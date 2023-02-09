export const supportedChains = [
    {
        id: 1,
        name: "Ethereum Mainnet",
        symbol: "ETH",
        nodeUrl: "https://1rpc.io/eth",
        explorerUrl: "https://etherscan.io"
    }, {
        id: 5,
        name: "Goerli",
        symbol: "ETH",
        nodeUrl: "https://rpc.ankr.com/eth_goerli",
        explorerUrl: "https://goerli.etherscan.io"
    }, {
        id: 137,
        name: "Polygon Mainnet",
        symbol: "MATIC",
        nodeUrl: "https://1rpc.io/matic",
        explorerUrl: "https://polygonscan.com"
    }, {
        id: 42161,
        name: "Arbitrum One",
        symbol: "ETH",
        nodeUrl: "https://1rpc.io/arb",
        explorerUrl: "https://arbiscan.io"
    }
]
export const walletConnectBridgeUrl = 'https://bridge.walletconnect.org'

export const libraryPollingInterval = 12000
export const nftpContractAddress = '0xC9e3a16f869C159DA241FC9c73A0B68b763d4A7d'
export const couponsContractAddress = '0x0cbFAC30A803A90e4FE052A323AA42D47498CA96'
export const userDidDummyContractAddress = '0x88bfc2c04f66FBE5Fa6bc58504F3823b70e97fC9'

export const dialogsTimeout = 3000