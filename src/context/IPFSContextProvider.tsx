import { create as ipfsClient, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, useContext } from "react";

export interface IPFSContextInterface {
    ipfs: IPFSHTTPClient,
}

const IPFSContext = createContext<IPFSContextInterface|null>(null);

export function IPFSContextProvider({ children }:any) {
    //const router = useRouter()
    const config:any = {
        //url: router.basePath.toString() + '/api/ipfs',
        url: 'http://localhost:3000/api/ipfs/ipfs',
    }
    const ipfs = ipfsClient(config)

    return (
        <IPFSContext.Provider value={{
            ipfs
        }}>
            {children}
        </IPFSContext.Provider>
    );
}

export function useIPFSContext() {
    const currentIPFSContext = useContext(IPFSContext);
    if (!currentIPFSContext) {
        throw new Error(
            "useIPFSContext has to be used within <IPFSContext.Provider>"
        );
    }
    return currentIPFSContext;
}