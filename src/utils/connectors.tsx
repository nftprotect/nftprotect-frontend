import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { supportedChains } from '../utils/config'

const supportedChainIds = supportedChains.map(it => it.id)

export const injected = new InjectedConnector({
    supportedChainIds: supportedChainIds,
})

export const walletConnect = new WalletConnectConnector({
    supportedChainIds: supportedChainIds,
    qrcode: true,
})