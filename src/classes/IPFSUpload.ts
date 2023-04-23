import { getCentralizedUrl, getRelativeIpfsUrl, getIpfsUrl } from "../utils/ipfs"

export interface IPFSUploadInterface {
    uploadResult: any,
    fileName?: string,
    wrappedWithDirectory?: boolean
}

export default class IPFSUpload {
    uploadResult: any
    fileName: string | undefined
    wrappedWithDirectory: boolean

    getV2Hash(): string {
        return this.uploadResult.cid.toString()
    }

    getV1Hash(): string {
        return this.uploadResult.cid.toV1().toString()
    }

    isDirectory(): boolean {
        return this.fileName ? false : true
    }

    getCentralizedUrl(): string {
        return getCentralizedUrl(this.getV2Hash())
    }

    getRelativeIPFSUrl(): string {
        return getRelativeIpfsUrl(this.getV2Hash(), this.fileName)
    }

    getAbsoluteIPFSUrl(): string {
        return getIpfsUrl(this.getV2Hash(), this.fileName)
    }

    constructor({uploadResult, fileName, wrappedWithDirectory}: IPFSUploadInterface) {
        this.uploadResult = uploadResult
        this.fileName = fileName
        this.wrappedWithDirectory = wrappedWithDirectory || false
    }
}