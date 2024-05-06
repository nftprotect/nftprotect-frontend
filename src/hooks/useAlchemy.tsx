import { useContext, useMemo } from "react";
import { Alchemy } from "alchemy-sdk";
import { AppContext, useAppContext } from "../context/AppContextProvider";

export interface AlchemyContextInterface {
    alchemy: Alchemy,
}

export function useAlchemy(alchemyChainId?: string) {

    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useAlchemyContext has to be used within <AppContext.Provider>"
        );
    }

    const { currentChain } = useAppContext()
    const chainId = alchemyChainId || currentChain?.alchemyId

    const alchemy = useMemo(() => {
        return new Alchemy({network: chainId, apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY });
    }, chainId)

    return alchemy;

}