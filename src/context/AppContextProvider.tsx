import { createContext, useContext, useEffect, useState } from "react";
import {  
    supportedChains,
    defaultChain 
} from "../config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import ArbitratorRegistryABI from '../abi/ArbitratorRegistryABI'
import DynamicArbitratorRegistryABI from '../abi/DynamicArbitratorRegistryABI'
import { Contract } from '@ethersproject/contracts';
import { defaultChain as defaultChainId } from "../config";
import { BaseProvider, Web3Provider } from '@ethersproject/providers'
import { getTokenPrice } from "../utils/coimarketcap";
import { useMemo } from "react";
import ERC20ABI from "../abi/ERC20ABI";
import { useAccount, useNetwork, useWalletClient, usePublicClient, useSwitchNetwork, PublicClient, WalletClient } from "wagmi";
import { clientToProvider } from '../utils/ethers';

export interface AppContextInterface {
    active: boolean,
    isCorrectChain: boolean,
    account: string | null | undefined,
    client: WalletClient|PublicClient,
    library: BaseProvider,
    defaultChain: any | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    arbRegistryContract: Contract,
    dynamicArbRegistryContract: Contract,
    referrerAddress: string,
    didRegistered: boolean | undefined,
    currentBlock: number | undefined,
    baseTokenPrice: number | undefined,
    fee: number | undefined,
    couponsBalance: number | undefined,
    setChainId: Function
}

interface AppState {
    active: boolean,
    account: string | null | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    userRegistryContract: Contract,
    arbRegistryContract: Contract,
    dynamicArbRegistryContract: Contract,
    couponsContract: Contract,
    client: WalletClient|PublicClient,
    library: BaseProvider
}

export const AppContext = createContext<AppContextInterface|null>(null);

const nullAddress = '0x0000000000000000000000000000000000000000'

export function AppContextProvider({ children }:any) {
    const [ chainId, setChainId ] = useState<number>()
    const publicClient = usePublicClient(chainId ? {chainId} : undefined)
    const publicProvider = clientToProvider(publicClient)
    const {
        data: walletClient,
        isSuccess: walletClientActive
    } = useWalletClient()
    const { 
        address: account,
        isConnected: active,
        isDisconnected
    } = useAccount()
    const { chain } = useNetwork()
    const isCorrectChain = !chainId || !chain || (chainId === chain?.id)
    const currentClient = walletClientActive && walletClient && isCorrectChain ? 
        walletClient : 
        publicClient
    const providedLibrary = clientToProvider(currentClient)

    const [appState, setAppState] = useState<AppState>({
        active: false,
        account: undefined,
        currentChain: undefined,
        client: currentClient,
        library: providedLibrary, // this and next props temporarily not null
        nftProtectContract: new Contract(nullAddress, NFTProtectABI, publicProvider),
        userRegistryContract: new Contract(nullAddress, UserRegistryABI, publicProvider),
        arbRegistryContract: new Contract(nullAddress, ArbitratorRegistryABI, publicProvider),
        dynamicArbRegistryContract: new Contract(nullAddress, DynamicArbitratorRegistryABI, publicProvider),
        couponsContract: new Contract(nullAddress, ERC20ABI, publicProvider)
    })

    const { switchNetwork } = useSwitchNetwork()
    const [ baseTokenPrice, setBaseTokenPrice ] = useState<number>()
    const referrerAddress = nullAddress
    const defaultChain = useMemo(() => defaultChainId ? supportedChains.find( it => it.id === defaultChainId ) : undefined, [defaultChainId])
    // Marks if user has DID registered
    const [ didRegistered, setDidRegistered ] = useState<boolean>()
    // Current fee for protecting
    const [ fee, setFee ] = useState<number>()
    const [ currentBlock, setCurrentBlock] = useState<number>()
    const [ couponsBalance, setCouponsBalance ] = useState<number>()

    const setDidState = () => {
        if (appState.active && appState.account && appState.currentChain) {
            console.log('IS REGISTERED', account)
            const { userRegistryContract } = appState
            userRegistryContract.isRegistered(account).then((result: boolean) => {
                console.log('DID Registered:', result)
                setDidRegistered(result)
            })
        } else {
            setDidRegistered(undefined)
        }
    }

    const setCurrentFee = () => {
        if (appState.library && appState.currentChain) {
            const { nftProtectContract } = appState
            nftProtectContract.feeWei(0).then((result: number) => {
                console.log('Fee:', result)
                setFee(result)
            })
        } else {
            setFee(undefined)
        }
    }

    const subscribeBlockUpdates = () => {
        const {active, library, currentChain} = appState
        if (library && currentChain) {
            library.getBlockNumber().then(blockNumber => setCurrentBlock(blockNumber))
            library.on('block', (blockNumber: number) => {
                setCurrentBlock(blockNumber)
            })
            // remove listener when the component is unmounted
            return () => {
                library.removeAllListeners('block')
            }
        } else {
            setCurrentBlock(undefined)
        }
    }
    
    // Loads and sets current base token price in USD
    const updateBaseTokenPrice = () => {
        const { currentChain } = appState 
        if (currentChain) {
            getTokenPrice(currentChain.symbol).then((result) => {
                setBaseTokenPrice(result)
            })
        }
    }

    const stateSetter = () => {
        let currentChain: any
        const library = providedLibrary
        const currentChainId = chainId || chain?.id
        if (currentChainId) {
            currentChain = supportedChains.find( it => it.id === currentChainId )
            if (!currentChain) {
                console.error('Chain not supported:', currentChainId)
                return
            }
        }
        const signer = library instanceof Web3Provider && 
            library.getSigner()
        setAppState({
            active: active && walletClientActive && isCorrectChain,
            account,
            currentChain,
            library,
            client: currentClient,
            nftProtectContract: new Contract(currentChain?.nftpContractAddress || nullAddress, NFTProtectABI, signer || library),
            userRegistryContract: new Contract(currentChain?.userRegistryContractAddress || nullAddress, UserRegistryABI, signer || library),
            arbRegistryContract: new Contract(currentChain?.arbRegistryContractAddress || nullAddress, ArbitratorRegistryABI, signer || library),
            dynamicArbRegistryContract: new Contract(currentChain?.dynamicArbRegistryContractAddress || nullAddress, DynamicArbitratorRegistryABI, signer || library),
            couponsContract: new Contract(currentChain?.couponsContractAddress || nullAddress, ERC20ABI, signer || library)
        })
    }

    useEffect(setDidState, [appState.account, appState.library, appState.currentChain])
    useEffect(subscribeBlockUpdates, [appState.account, appState.library, appState.currentChain])
    useEffect(setCurrentFee, [appState.library, appState.currentChain])
    useEffect(updateBaseTokenPrice, [appState.library, appState.currentChain])
    useEffect(stateSetter, [walletClient, account, active, walletClientActive, chain, switchNetwork, chainId, isDisconnected])

    const couponsBalanceLoader = async () => {
        const balance = await appState.couponsContract.balanceOf(appState.account)
        console.log("Coupons balance:", balance)
        setCouponsBalance(balance.toNumber())
    }

    // Set coupons balance
    useEffect(() => {
        const { active, account, currentChain } = appState
        if (active && account && currentChain) {
            couponsBalanceLoader()
        }
    }, [appState.active, appState.account, appState.currentChain])

    // Update coupons balance
    useEffect(() => {
        const { active, account, currentChain, couponsContract } = appState
        if (active && account && currentChain) {
            const fromMe = couponsContract.filters.Transfer(account, null)
            couponsContract.on(fromMe, (from, to, amount, event) => {
                console.log('Transfer|sent', { from, to, amount, event })
                couponsBalanceLoader()
            })
        
            const toMe = couponsContract.filters.Transfer(null, account)
            couponsContract.on(toMe, (from, to, amount, event) => {
                console.log('Transfer|received', { from, to, amount, event })
                couponsBalanceLoader()
            })
        
            // remove listener when the component is unmounted
            return () => {
                couponsContract.removeAllListeners(toMe)
                couponsContract.removeAllListeners(fromMe)
            }
        }
        // trigger the effect only on component mount
    }, [appState.active, appState.account, appState.currentChain])

    return (
        <AppContext.Provider value={{
            ...appState,
            isCorrectChain,
            defaultChain,
            referrerAddress,
            didRegistered,
            currentBlock,
            fee,
            setChainId,
            baseTokenPrice,
            couponsBalance
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const currentAppContext = useContext(AppContext);
    if (!currentAppContext) {
        throw new Error(
            "useAppContext has to be used within <AppContext.Provider>"
        );
    }
    return currentAppContext;
}