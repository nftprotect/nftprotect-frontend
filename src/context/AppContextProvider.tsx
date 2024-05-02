import { createContext, useContext, useEffect, useState } from "react";
import {  
    supportedChains,
    defaultChain 
} from "../config";
import NFTProtectABI from "../abi/NFTProtectABI";
import UserRegistryABI from "../abi/UserRegistryABI";
import ArbitratorRegistryABI from '../abi/ArbitratorRegistryABI'
import { Contract } from '@ethersproject/contracts';
import { defaultChain as defaultChainId } from "../config";
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { getTokenPrice } from "../utils/coimarketcap";
import { useMemo } from "react";
import ERC20ABI from "../abi/ERC20ABI";
import { useAccount, useWalletClient, usePublicClient, useClient, useSwitchChain, useConnectorClient, useBlockNumber} from "wagmi";
import { Client, PublicClient, WalletClient } from "viem";
import { clientToProvider } from '../utils/ethers';
import { useRouter } from "next/router";
import { handleReferralLink, loadInvite, loadReferrer } from "../utils/referral";
import SignatureVerifierABI from "../abi/SignatureVerifierABI";
import { useNftProtectGraph } from "../hooks/useNftProtectGraph";

export interface AppContextInterface {
    active: boolean,
    isCorrectChain: boolean,
    account: `0x${string}` | null | undefined,
    client: Client,
    library: Web3Provider,
    defaultChain: any | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    arbRegistryContract: Contract,
    signatureVerifierContract: Contract,
    referrerAddress: `0x${string}`,
    currentBlock: number | undefined,
    baseTokenPrice: number | undefined,
    fee: number | undefined,
    setChainId: Function,
}

interface AppState {
    active: boolean,
    account: `0x${string}` | null | undefined,
    currentChain: any | undefined,
    nftProtectContract: Contract,
    userRegistryContract: Contract,
    arbRegistryContract: Contract,
    signatureVerifierContract: Contract,
    client: Client|undefined,
    library: Web3Provider|undefined
}

export const AppContext = createContext<AppContextInterface|null>(null);

const nullAddress = '0x0000000000000000000000000000000000000000'

export function AppContextProvider({ children }:any) {
    const router = useRouter()
    const [ chainId, setChainId ] = useState<number>()

    const { 
        address: account,
        isConnected: active,
        isDisconnected,
        chain
    } = useAccount()
    const isCorrectChain = !chainId || !chain || (chainId === chain?.id)
    const client  = useClient(chainId ? {chainId} : undefined)
    const {data: connectorClient} = useConnectorClient()
    const currentClient = connectorClient || client
    const providedLibrary = currentClient ? clientToProvider(currentClient) : undefined

    const [appState, setAppState] = useState<AppState>({
        active: false,
        account: undefined,
        currentChain: undefined,
        client: currentClient,
        library: providedLibrary, // this and next props temporarily not null
        nftProtectContract: new Contract(nullAddress, NFTProtectABI, providedLibrary),
        userRegistryContract: new Contract(nullAddress, UserRegistryABI, providedLibrary),
        arbRegistryContract: new Contract(nullAddress, ArbitratorRegistryABI, providedLibrary),
        signatureVerifierContract: new Contract(nullAddress, SignatureVerifierABI, providedLibrary)
    })

    const { switchChain } = useSwitchChain()
    const [ baseTokenPrice, setBaseTokenPrice ] = useState<number>()
    const defaultChain = useMemo(() => defaultChainId ? supportedChains.find( it => it.id === defaultChainId ) : undefined, [defaultChainId])
    // Current fee for protecting
    const [ fee, setFee ] = useState<number>()
    const {data: currentBlockBigInt} = useBlockNumber({chainId: appState.currentChain?.id || defaultChain})
    const currentBlock = Number(currentBlockBigInt); // TODO: use bigint instead
    const [referrerAddress, setReferrerAddress] = useState<`0x${string}`>(nullAddress)
    const { getSystem, getPartner, getUser } = useNftProtectGraph(appState.currentChain?.id || defaultChainId);

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
        const signer =  account && library?.getSigner(account)
        setAppState({
            active: active && isCorrectChain,
            account,
            currentChain,
            library,
            client: currentClient,
            nftProtectContract: new Contract(currentChain?.nftpContractAddress || nullAddress, NFTProtectABI, signer || library),
            userRegistryContract: new Contract(currentChain?.userRegistryContractAddress || nullAddress, UserRegistryABI, signer || library),
            arbRegistryContract: new Contract(currentChain?.arbRegistryContractAddress || nullAddress, ArbitratorRegistryABI, signer || library),
            signatureVerifierContract: new Contract(currentChain?.signatureVerifierContractAddress || nullAddress, SignatureVerifierABI, signer || library)
        })
    }

    useEffect(updateBaseTokenPrice, [appState.library, appState.currentChain])
    useEffect(stateSetter, [account, active, chain, switchChain, chainId, isDisconnected, currentClient])

    // Handle referral link
    useEffect(() => {
        const refParam = router.query.ref;
        // If parameter exists and is string
        if (typeof refParam === 'string') {
            // Extracts address from referral link and saves to localStorage
            handleReferralLink(refParam);
        }
    }, [router]);

    // Handle referrer address
    useEffect(() => {
        const fetchReferrerData = async () => {
            const { account, active } = appState;
            if (active && account && (referrerAddress === nullAddress)) {
                try {
                    const userData = await getUser(account);
                    if (userData && userData.referrer !== nullAddress) {
                        console.log('Referrer address exists:', userData.referrer);
                        setReferrerAddress(userData.referrer as `0x${string}`);
                    } else {
                        const inviteAddr = loadInvite();
                        if (inviteAddr?.toLowerCase() === account.toLowerCase()) {
                            console.error("Referrer address can't match account address");
                        } else if (inviteAddr) {
                            console.log('Setting invite address as referrer');
                            setReferrerAddress(inviteAddr);
                        } else {
                            console.log('No referrer or invite found');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching referrer data:", error);
                }
            }
        };
    
        fetchReferrerData();
    }, [appState.account, appState.currentChain]);

    // Load fee from graph
    useEffect(() => {
        const updateFeeBasedOnSystemAndPartner = async () => {
            if (!appState.currentChain || !appState.account) {
                setFee(undefined);
                return;
            }

            try {
                const systemData = await getSystem();
                let finalFee = systemData.feeEntry;

                try {
                    const partnerData = await getPartner(appState.account);
                    if (partnerData) {
                        // Предполагаем, что скидка представлена в процентах и применяется к feeEntry
                        const discount = partnerData.discount;
                        finalFee = finalFee.mul(100 - discount).div(100);
                    }
                } catch (error) {
                    console.warn("Partner data not found or error fetching:", error);
                }

                setFee(finalFee.toNumber()); // TODO: use BigNumber / bigint
            } catch (error) {
                console.error("Failed to fetch system or partner data:", error);
                setFee(undefined);
            }
        };

        updateFeeBasedOnSystemAndPartner();
    }, [appState.currentChain, appState.account]);


    return (
        appState.library && appState.client && <AppContext.Provider value={{
            ...appState,
            library: appState.library,
            client: appState.client,
            isCorrectChain,
            defaultChain,
            referrerAddress,
            currentBlock,
            fee,
            setChainId,
            baseTokenPrice,
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