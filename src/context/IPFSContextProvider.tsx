import { create as ipfsClient, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, useContext } from "react";
import { ipfsUrlMask } from '../utils/config';

export interface IPFSContextInterface {
    ipfs: IPFSHTTPClient,
    getIpfsUrl: Function,
    getCentralizedUrl: Function,
    centalizeIpfsUrl: Function
}

const IPFSContext = createContext<IPFSContextInterface|null>(null);

export function IPFSContextProvider({ children }:any) {
    //const router = useRouter()
    const config:any = {
        //url: router.basePath.toString() + '/api/ipfs',
        url: 'http://localhost:3000/api/ipfs/ipfs',
    }
    const ipfs = ipfsClient(config)

    // Returns ipfs url by hash
    const getIpfsUrl = (hash: string) => {
        return `ipfs://${hash}/`
    }

    // Returns url with defined IPFS provider by hash
    const getCentralizedUrl = (hash: string) => {
        return ipfsUrlMask.replace('{HASH}', hash)
    }

    // Makes centralized url from ipfs:// url
    const centalizeIpfsUrl = (url: string) => {
        if (url.startsWith('ipfs://')) {
            const hash = url.replace('ipfs://','').replaceAll('/','')
            return getCentralizedUrl(hash)
        } else {
            return url
        }
    }

    return (
        <IPFSContext.Provider value={{
            ipfs,
            getIpfsUrl,
            getCentralizedUrl,
            centalizeIpfsUrl
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