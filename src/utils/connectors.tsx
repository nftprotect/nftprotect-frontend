import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const supportedChainIds = [
    1, 
    3, 
    4, 
    5, 
    10, 
    42, 
    137,
    31337, 
    42161
]

export const injected = new InjectedConnector({
    supportedChainIds: supportedChainIds,
})

export const walletConnect = new WalletConnectConnector({
    supportedChainIds: supportedChainIds,
    qrcode: true,
})