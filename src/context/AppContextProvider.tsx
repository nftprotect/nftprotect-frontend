import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useEffect, useState } from "react";
import { 
    nftpContractAddress, 
    userRegistryContractAddress, 
    supportedChains,
    dynamicArbRegistryContractAddress,
    defaultChain 
} from "../utils/config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import ArbitratorRegistryABI from '../abi/ArbitratorRegistryABI'
import { Contract } from '@ethersproject/contracts';
import { defaultChain as defaultChainId } from "../utils/config";
import { JsonRpcProvider } from '@ethersproject/providers'
import { getTokenPrice } from "../utils/coimarketcap";

export interface AppContextInterface {
    active: boolean,
    account: string | null | undefined,
    library: any,
    defaultChain: any | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    arbitratorRegistryContract: Contract,
    referrerAddress: string,
    didRegistered: boolean | undefined,
    currentBlock: number,
    baseTokenPrice: number | undefined,
    fee: number | undefined,
    setChainId: Function
}

export const AppContext = createContext<AppContextInterface|null>(null);

export function AppContextProvider({ children }:any) {
    const { 
        active, 
        account,
        // If no provider (library) provided, we will set JsonRpcProvider
        library: providedLibrary
    } = useWeb3React()
    const [ library, setLibrary ] = useState<JsonRpcProvider>(providedLibrary)
    const [ baseTokenPrice, setBaseTokenPrice ] = useState<number>()
    const chainId = providedLibrary?.network?.chainId || defaultChainId
    const nftProtectContract = new Contract(nftpContractAddress, NFTProtectABI, providedLibrary?.getSigner() || library)
    const userRegistryContract = new Contract(userRegistryContractAddress, UserRegistryABI, providedLibrary?.getSigner() || library)
    const arbitratorRegistryContract = new Contract(dynamicArbRegistryContractAddress, ArbitratorRegistryABI, providedLibrary?.getSigner() || library)
    const referrerAddress = '0x0000000000000000000000000000000000000000'
    const currentChain = chainId ? supportedChains.find( it => it.id === chainId ) : undefined
    const defaultChain = defaultChainId ? supportedChains.find( it => it.id === defaultChainId ) : undefined
    // Marks if user has DID registered
    const [ didRegistered, setDidRegistered ] = useState<boolean>()
    // Current fee for protecting
    const [ fee, setFee ] = useState<number>()
    const [ currentBlock, setCurrentBlock] = useState<number>(0)

    const setDidState = () => {
        if (active && currentChain) {
            userRegistryContract.isRegistered(account).then((result: boolean) => {
                console.log('DID Registered:', result)
                setDidRegistered(result)
            })
        } else {
            setDidRegistered(undefined)
        }
    }

    const setCurrentFee = () => {
        if (active && currentChain) {
            nftProtectContract.feeWei(0).then((result: number) => {
                console.log('Fee:', result)
                setFee(result)
            })
        } else {
            setFee(undefined)
        }
    }

    const subscribeBlockUpdates = () => {
        if (library) {
            library.on('block', (blockNumber: number) => {
                setCurrentBlock(blockNumber)
            })
            // remove listener when the component is unmounted
            return () => {
                library.removeAllListeners('block')
            }
        }
    }

    const setChainId = (chainId: number) => {
        if (!providedLibrary) {
            const chain = supportedChains.find( it => it.id === chainId )
            if (chain) {
                setLibrary(new JsonRpcProvider(chain.nodeUrl, chainId))
            } else {
                console.error('Chain not supported:', chainId)
            }
        } else {
            console.error('You can set chainId only when fallback provider is used')
        }
    }
    
    // Loads and sets current base token price in USD
    const updateBaseTokenPrice = () => {
        if (currentChain) {
            getTokenPrice(currentChain.symbol).then((result) => {
                setBaseTokenPrice(result)
            })
        }
    }

    useEffect(setDidState, [active, account, chainId])
    useEffect(subscribeBlockUpdates, [active, account, chainId])
    useEffect(setCurrentFee, [active, chainId])
    useEffect(() => {
        if (providedLibrary) {
            (providedLibrary !== library) && setLibrary(providedLibrary)
        } else {
            setChainId(chainId)
        }
    }, [providedLibrary])
    
   useEffect(updateBaseTokenPrice, [chainId])

    return (
        <AppContext.Provider value={{
            active,
            account,
            library: providedLibrary || library,
            currentChain,
            defaultChain,
            nftProtectContract,
            arbitratorRegistryContract,
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