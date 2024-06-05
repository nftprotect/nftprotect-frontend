type EthereumProvider = { request(...args: any): Promise<any> };
declare global {
    interface Window {
        ethereum?: EthereumProvider
    }
}