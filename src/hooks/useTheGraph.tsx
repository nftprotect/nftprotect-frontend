import { useContext } from "react";
import { TheGraphContext } from "../context/TheGraphContextProvider";

export const useTheGraph = () => {
    const currentContext = useContext(TheGraphContext)
    if (!currentContext) {
        throw new Error(
            "useTheGraph has to be used within <TheGraphContext.Provider>"
        );
    }
    return currentContext
}