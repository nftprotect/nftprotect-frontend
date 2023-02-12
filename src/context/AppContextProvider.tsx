import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useEffect, useState } from "react";
import { nftpContractAddress, userRegistryContractAddress, supportedChains } from "../utils/config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import { Contract } from '@ethersproject/contracts';

export interface AppContextInterface {
    active: boolean,
    account: string | null | undefined,
    library: any,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    referrerAddress: string,
    didRegistered: boolean | null
}

const AppContext = createContext<AppContextInterface|null>(null);

export function AppContextProvider({ children }:any) {

    const { chainId, active, account, library } = useWeb3React()
    const nftProtectContract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())
    const userRegistryContract = new Contract(userRegistryContractAddress, UserRegistryABI, library?.getSigner())
    const referrerAddress = '0x0000000000000000000000000000000000000000'
    const currentChain = chainId ? supportedChains.find( it => it.id === chainId ) : undefined
    // Зарегистрировал ли пользователь DID
    const [ didRegistered, setDidRegistered ] = useState<boolean|null>(null)

    const setDidState = () => {
        if (active) {
            userRegistryContract.isRegistered(account).then((result: boolean) => {
                console.log('DID Registered:', result)
                setDidRegistered(result)
            })
        } else {
            setDidRegistered(null)
        }
    }

    useEffect(setDidState, [active, account, chainId])

    return (
        <AppContext.Provider value={{
            active,
            account,
            library,
            currentChain,
            nftProtectContract,
            referrerAddress,
            didRegistered
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