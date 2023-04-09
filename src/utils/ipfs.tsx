import { ipfsUrlMask } from "./config"

// Returns ipfs url by hash
export const getIpfsUrl = (hash: string, fileName:string|undefined = undefined) => {
    return encodeURI(`ipfs://${hash}/` + (fileName || ''))
}

// Returns ipfs url by hash
export const getRelativeIpfsUrl = (hash: string, fileName:string|undefined = undefined) => {
    return encodeURI(`/ipfs/${hash}/` + (fileName || ''))
}

// Returns url with defined IPFS provider by hash
export const getCentralizedUrl = (hash: string, fileName: string|undefined = undefined) => {
    return encodeURI(ipfsUrlMask.replace('{HASH}', hash).replace('{FILENAME}', fileName || ''))
}

// Makes centralized url from ipfs:// url
export const centralizeIpfsUrl = (url: string) => {
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