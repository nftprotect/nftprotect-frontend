import { create as ipfsClient, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, Dispatch, useContext, useEffect } from "react";
import { useState, SetStateAction } from 'react';

export interface IPFSContextInterface {
    ipfs: IPFSHTTPClient | undefined,
    setBaseUrl: Dispatch<SetStateAction<string | undefined>>
}

const IPFSContext = createContext<IPFSContextInterface|null>(null);

export function IPFSContextProvider({ children }:any) {
    const [baseUrl, setBaseUrl] = useState<string>()
    const [ipfs, setIpfs] = useState<IPFSHTTPClient>()
    
    useEffect(() => {
        if (baseUrl) {
            const config:any = {
                url: baseUrl + '/api/ipfs/ipfs'
            }
            setIpfs(ipfsClient(config))
        }
    }, [baseUrl])

    useEffect(() => {
        ipfs && console.log('IPFS', ipfs)
    }, [ipfs])

    return (
        <IPFSContext.Provider value={{
            ipfs, setBaseUrl
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