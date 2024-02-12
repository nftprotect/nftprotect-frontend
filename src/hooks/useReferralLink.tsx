import { useContext } from "react";
import { appUrl } from "../config";
import { AppContext, useAppContext } from "../context/AppContextProvider";

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
    const encodedAccount = Buffer.from(account).toString('base64');
    return `${appUrl}?ref=${encodedAccount}`;
}