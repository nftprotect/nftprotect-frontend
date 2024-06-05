import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {  
    supportedChains,
    defaultChain as defaultChainId
} from "../config";
import { getTokenPrice } from "../utils/coimarketcap";
import { useAccount, useSwitchChain } from "wagmi";
import { useRouter } from "next/router";
import { handleReferralLink, loadInvite } from "../utils/referral";
import { useNftProtectGraph } from "../hooks/useNftProtectGraph";

export interface AppContextInterface {
    active: boolean,
    isCorrectChain: boolean,
    account: `0x${string}` | null | undefined,
    defaultChain: any | undefined,
    currentChain: any | undefined,
    referrerAddress: `0x${string}`,
    baseTokenPrice: number | undefined,
    fee: bigint | undefined,
    setChainId: Function,
}

export const AppContext = createContext<AppContextInterface|null>(null);

const nullAddress = '0x0000000000000000000000000000000000000000'
const defaultChain = supportedChains.find( it => it.id === defaultChainId )

export function AppContextProvider({ children }:any) {
    const router = useRouter()
    const [ chainId, setChainId ] = useState<number>()

    const { 
        address: account,
        isConnected: active,
        isDisconnected,
        chain
    } = useAccount()

    const currentChain = useMemo(() => supportedChains.find( it => it.id === chain?.id ), [chain])
    const isCorrectChain = currentChain ? ((chainId === undefined) || (chainId === currentChain.id)) : false

    const { switchChain } = useSwitchChain()
    const [ baseTokenPrice, setBaseTokenPrice ] = useState<number>()
    // Current fee for protecting
    const [ fee, setFee ] = useState<bigint>()
    const [referrerAddress, setReferrerAddress] = useState<`0x${string}`>(nullAddress)
    const { getSystem, getPartner, getUser } = useNftProtectGraph(currentChain?.id || defaultChainId);

    // Loads and sets current base token price in USD
    const updateBaseTokenPrice = () => {
        if (currentChain) {
            getTokenPrice(currentChain.symbol).then((result) => {
                setBaseTokenPrice(result)
            })
        }
    }

    useEffect(updateBaseTokenPrice, [currentChain])
    // Handle chain switching
    useEffect(() => {
        if (chain && chainId && chain.id !== chainId) {
            const nextChain = supportedChains.find( it => it.id === chainId )
            if (!nextChain) {
                console.error('Chain not supported:', chainId)
                return
            }
            switchChain({chainId})
        }
    }, [chain, chainId, switchChain])

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
            if (active && account && (referrerAddress === nullAddress)) {
                try {
                    const userData = await getUser(account);
                    if (userData?.referrer && userData.referrer !== nullAddress) {
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
                            setReferrerAddress(nullAddress)
                            console.log('No referrer or invite found');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching referrer data:", error);
                }
            }
        };
    
        fetchReferrerData();
    }, [account, currentChain]);

    // Load fee from graph
    useEffect(() => {
        const updateFeeBasedOnSystemAndPartner = async () => {
            if (!currentChain || !account) {
                setFee(undefined);
                return;
            }

            try {
                const systemData = await getSystem();
                let finalFee = systemData.feeEntry;

                try {
                    const partnerData = await getPartner(account);
                    if (partnerData) {
                        const discount = partnerData.discount;
                        finalFee = finalFee * BigInt(100 - discount)/BigInt(100);
                    }
                } catch (error) {
                    console.warn("Partner data not found or error fetching:", error);
                }

                setFee(finalFee);
            } catch (error) {
                console.error("Failed to fetch system or partner data:", error);
                setFee(undefined);
            }
        };

        updateFeeBasedOnSystemAndPartner();
    }, [currentChain, account]);

    return (
        <AppContext.Provider value={{
            account,
            active,
            currentChain,
            isCorrectChain,
            defaultChain,
            referrerAddress,
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