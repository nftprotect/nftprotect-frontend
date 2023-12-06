import { create as ipfsClient, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, Dispatch, useContext, useEffect } from "react";
import { useState, SetStateAction } from 'react';
import { createHelia, Helia } from 'helia';

export interface IPFSContextInterface {
    // ipfs: IPFSHTTPClient | undefined,
    // setBaseUrl: Dispatch<SetStateAction<string | undefined>>
    helia: Helia | undefined,
    isOnline: boolean,
    nodeId: string | undefined,
}

const IPFSContext = createContext<IPFSContextInterface|null>(null);

export function IPFSContextProvider({ children }:any) {
    const [baseUrl, setBaseUrl] = useState<string>()
    const [ipfs, setIpfs] = useState<IPFSHTTPClient>()

    const [id, setId] = useState<string>()
    const [helia, setHelia] = useState<Helia>()
    const [isOnline, setIsOnline] = useState<boolean>(false)
    
    useEffect(() => {
        const init = async () => {
            if (helia) return
        
            const heliaNode = await createHelia()
        
            const nodeId = heliaNode.libp2p.peerId.toString()
            const nodeIsOnline = heliaNode.libp2p.isStarted()
        
            setHelia(heliaNode)
            setId(nodeId)
            setIsOnline(nodeIsOnline)
            console.log('HELIA', heliaNode)
        }
    
        // init()
    }, [])

    // useEffect(() => {
    //     if (baseUrl) {
    //         const config:any = {
    //             url: baseUrl + '/api/ipfs/ipfs'
    //         }
    //         setIpfs(ipfsClient(config))
    //     }
    // }, [baseUrl])

    // useEffect(() => {
    //     ipfs && console.log('IPFS', ipfs)
    // }, [ipfs])

    return (
        <IPFSContext.Provider value={{
            // ipfs, setBaseUrl
            helia, 
            isOnline,
            nodeId: id
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