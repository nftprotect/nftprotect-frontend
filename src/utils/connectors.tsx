import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { supportedChains, walletConnectBridgeUrl } from '../utils/config'

const supportedChainIds = supportedChains.map(it => it.id)
const rpc:any = {}
supportedChains.forEach(({id, nodeUrl}) => {
    rpc[id] = nodeUrl
})

export const injected = new InjectedConnector({
    supportedChainIds: supportedChainIds,
})

export const walletConnect = new WalletConnectConnector({
    supportedChainIds: supportedChainIds,
    qrcode: true,
    rpc: rpc,
    bridge: walletConnectBridgeUrl
})