import { createContext, useContext } from "react";
import { Alchemy } from "alchemy-sdk";
import { useAppContext } from "./AppContextProvider";

export interface AlchemyContextInterface {
    alchemy: Alchemy,
}

const AlchemyContext = createContext<AlchemyContextInterface|null>(null);

export function AlchemyContextProvider({ children }:any) {
    const { currentChain } = useAppContext()

    const settings = {
        apiKey: process.env.ALCHEMY_API_KEY, 
        network: currentChain?.alchemyId
    };
  
    const alchemy = currentChain && new Alchemy(settings);

    return (
        <AlchemyContext.Provider value={{
            alchemy
        }}>
            {children}
        </AlchemyContext.Provider>
    );
}

export function useAlchemyContext() {
    const currentAlchemyContext = useContext(AlchemyContext);
    if (!currentAlchemyContext) {
        throw new Error(
            "useAlchemyContext has to be used within <AlchemyContext.Provider>"
        );
    }
    return currentAlchemyContext;
}