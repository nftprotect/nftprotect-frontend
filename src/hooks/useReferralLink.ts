import { useContext } from "react";
import { appUrl } from "../config";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { encodeAddress } from "../utils/referral";

// Generates referral link
export const useReferralLink = () => {
    const currentContext = useContext(AppContext)
    if (!currentContext) {
        throw new Error(
            "useArbitrable has to be used within <AppContext.Provider>"
        );
    }
    
    const { account } = useAppContext();
    if (!account) return null;
    const encodedAccount = encodeAddress(account);
    return `${appUrl}?ref=${encodedAccount}`;
}