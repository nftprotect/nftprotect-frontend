import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useEffect, useState } from "react";
import { nftpContractAddress, userRegistryContractAddress, supportedChains, defaultChain } from "../utils/config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import { Contract } from '@ethersproject/contracts';
import { defaultChain as defaultChainId } from "../utils/config";

export interface AppContextInterface {
    active: boolean,
    account: string | null | undefined,
    library: any,
    defaultChain: any | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    referrerAddress: string,
    didRegistered: boolean | undefined,
    currentBlock: number,
    fee: number | undefined
}

export const AppContext = createContext<AppContextInterface|null>(null);

export function AppContextProvider({ children }:any) {

    const { chainId, active, account, library } = useWeb3React()
    const nftProtectContract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())
    const userRegistryContract = new Contract(userRegistryContractAddress, UserRegistryABI, library?.getSigner())
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

    useEffect(setDidState, [active, account, chainId])
    useEffect(subscribeBlockUpdates, [active, account, chainId])
    useEffect(setCurrentFee, [active, chainId])

    return (
        <AppContext.Provider value={{
            active,
            account,
            library,
            currentChain,
            defaultChain,
            nftProtectContract,
            referrerAddress,
            didRegistered,
            currentBlock,
            fee
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