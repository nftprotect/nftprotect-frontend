import { create as ipfsClient, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, useContext } from "react";
import { ipfsUrlMask } from '../utils/config';

export interface IPFSContextInterface {
    ipfs: IPFSHTTPClient,
    getIpfsUrl: Function,
    getCentralizedUrl: Function,
    centralizeIpfsUrl: Function
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
    const getIpfsUrl = (hash: string, fileName:string|undefined = undefined) => {
        return encodeURI(`ipfs://${hash}/` + (fileName || ''))
    }

    // Returns url with defined IPFS provider by hash
    const getCentralizedUrl = (hash: string, fileName: string|undefined = undefined) => {
        return encodeURI(ipfsUrlMask.replace('{HASH}', hash).replace('{FILENAME}', fileName || ''))
    }

    // Makes centralized url from ipfs:// url
    const centralizeIpfsUrl = (url: string) => {
        if (url.startsWith('ipfs://')) {
            const splitted = url.replace('ipfs://','').split('/')
            const hash = splitted[0]
            const fileName = (splitted.length > 0) ? splitted[1] : ''
            return getCentralizedUrl(hash,fileName)
        } else if (url.startsWith('/ipfs/')) {
            const splitted = url.replace('/ipfs/','').split('/')
            const hash = splitted[0]
            const fileName = (splitted.length > 0) ? splitted[1] : ''
            return getCentralizedUrl(hash,fileName)
        } else {
            return url
        }
    }

    return (
        <IPFSContext.Provider value={{
            ipfs,
            getIpfsUrl,
            getCentralizedUrl,
            centralizeIpfsUrl
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