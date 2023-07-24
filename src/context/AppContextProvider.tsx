import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useEffect, useState } from "react";
import {  
    supportedChains,
    defaultChain 
} from "../utils/config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import ArbitratorRegistryABI from '../abi/ArbitratorRegistryABI'
import DynamicArbitratorRegistryABI from '../abi/DynamicArbitratorRegistryABI'
import { Contract } from '@ethersproject/contracts';
import { defaultChain as defaultChainId } from "../utils/config";
import { JsonRpcProvider } from '@ethersproject/providers'
import { getTokenPrice } from "../utils/coimarketcap";
import { useMemo } from "react";
import { switchNetwork } from "../utils/helpers";

export interface AppContextInterface {
    active: boolean,
    account: string | null | undefined,
    library: any,
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
    library: JsonRpcProvider
}

export const AppContext = createContext<AppContextInterface|null>(null);

const nullAddress = '0x0000000000000000000000000000000000000000'

export function AppContextProvider({ children }:any) {
    const { 
        active, 
        account,
        // If no provider (library) provided, we will set JsonRpcProvider
        library: providedLibrary
    } = useWeb3React()

    const [appState, setAppState] = useState<AppState>({
        active: false,
        account: undefined,
        currentChain: undefined,
        library: providedLibrary, // this and next props temporarily not null
        nftProtectContract: new Contract(nullAddress, NFTProtectABI, providedLibrary?.getSigner()),
        userRegistryContract: new Contract(nullAddress, UserRegistryABI, providedLibrary?.getSigner()),
        arbRegistryContract: new Contract(nullAddress, ArbitratorRegistryABI, providedLibrary?.getSigner()),
        dynamicArbRegistryContract: new Contract(nullAddress, DynamicArbitratorRegistryABI, providedLibrary?.getSigner())
    })

    //const [ library, setLibrary ] = useState<JsonRpcProvider>(providedLibrary)
    const [ baseTokenPrice, setBaseTokenPrice ] = useState<number>()
    const [ chainId, setChainId ] = useState<number>()
    const referrerAddress = nullAddress
    const defaultChain = useMemo(() => defaultChainId ? supportedChains.find( it => it.id === defaultChainId ) : undefined, [defaultChainId])
    // Marks if user has DID registered
    const [ didRegistered, setDidRegistered ] = useState<boolean>()
    // Current fee for protecting
    const [ fee, setFee ] = useState<number>()
    const [ currentBlock, setCurrentBlock] = useState<number>()

    const setDidState = () => {
        if (active && account && appState.currentChain) {
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
        if (active && appState.currentChain) {
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
        const {library, currentChain} = appState
        if (library && currentChain) {
            library.getBlockNumber().then(blockNumber => setCurrentBlock(blockNumber))
            library.on('block', (blockNumber: number) => {
                setCurrentBlock(blockNumber)
            })
            // remove listener when the component is unmounted
            return () => {
                library.removeAllListeners('block')
            }
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

    useEffect(setDidState, [appState.account, appState.library, appState.currentChain])
    useEffect(subscribeBlockUpdates, [appState.account, appState.library, appState.currentChain])
    useEffect(setCurrentFee, [appState.library, appState.currentChain])
    useEffect(updateBaseTokenPrice, [appState.library, appState.currentChain])
    useEffect(() => {
        const stateSetter  = async () => {
            let library: JsonRpcProvider|undefined = undefined
            let currentChain: any
            if (chainId) {
                if (!providedLibrary) {
                    currentChain = supportedChains.find( it => it.id === chainId )
                    if (currentChain) {
                        library = new JsonRpcProvider(currentChain.nodeUrl, chainId)
                    } else {
                        console.error('Chain not supported:', chainId)
                    }
                } else {
                    console.error('You can set chainId only when fallback provider is used')
                }
            }
            if (!library) {
                library = providedLibrary as JsonRpcProvider
                const network = await library?.getNetwork()
                if (network) {
                    currentChain = supportedChains.find( it => it.id === network?.chainId )
                    if (!currentChain) {
                        // It doesn't reach this point actually because of exception in connector (e.g. ConnectMetamask)
                        await switchNetwork(defaultChainId)
                        console.error('Chain not supported:', network?.chainId)
                        return
                    }
                } else {
                    console.error("Provider has no network", library)
                    return
                }
                
            }
            // I don't know why, but for web3provider we have to pass signer
            const signer = chainId ? library : library.getSigner() 
            setAppState({
                active,
                account,
                currentChain,
                library, // this and next props temporarily not null
                nftProtectContract: new Contract(currentChain.nftpContractAddress, NFTProtectABI, signer),
                userRegistryContract: new Contract(currentChain.userRegistryContractAddress, UserRegistryABI, signer),
                arbRegistryContract: new Contract(currentChain.arbRegistryContractAddress, ArbitratorRegistryABI, signer),
                dynamicArbRegistryContract: new Contract(currentChain.dynamicArbRegistryContractAddress, DynamicArbitratorRegistryABI, signer)
            })
        }
        stateSetter()
    }, [providedLibrary, account, active, chainId])

    return (
        <AppContext.Provider value={{
            ...appState,
            defaultChain,
            referrerAddress,
            didRegistered,
            currentBlock,
            fee,
            setChainId,
            baseTokenPrice
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