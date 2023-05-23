import { getCentralizedUrl, getRelativeIpfsUrl, getIpfsUrl } from "../utils/ipfs"

export interface IPFSUploadInterface {
    uploadResult: any,
    fileName?: string,
    fileNames?: string[],
    wrappedWithDirectory?: boolean
}

export default class IPFSUpload {
    uploadResult: any
    fileName: string | undefined
    fileNames: string[] | undefined
    isMultiple: boolean
    wrappedWithDirectory: boolean

    getV2Hash(fileName?: string): string {
        return this.getCID(fileName).toString()
    }

    getV1Hash(fileName?: string): string {
        return this.getCID(fileName).toV1().toString()
    }

    private getCID(fileName?: string): any {
        let cid
        if (fileName) {
            this.checkFileName(fileName)
            cid = this.uploadResult.find(({path}: {path: string}) => path === fileName).cid
        } else {
            cid = this.isMultiple ? 
                this.uploadResult[this.uploadResult.length - 1].cid :
                this.uploadResult.cid
        }
        return cid
    }

    // isDirectory(): boolean {
    //     return this.fileName ? false : true
    // }

    getCentralizedUrl(fileName?: string): string {
        fileName && this.checkFileName(fileName)
        let name = this.isMultiple ? fileName : this.fileName
        return name ?
            getCentralizedUrl(this.getV2Hash(), name) :
            getCentralizedUrl(this.getV2Hash())
    }

    getRelativeIPFSUrl(fileName?: string): string {
        fileName && this.checkFileName(fileName)
        let name = this.isMultiple ? fileName : this.fileName
        return name ?
            getRelativeIpfsUrl(this.getV2Hash(), name) :
            getRelativeIpfsUrl(this.getV2Hash())
    }

    getAbsoluteIPFSUrl(fileName?: string): string {
        fileName && this.checkFileName(fileName)
        let name = this.isMultiple ? fileName : this.fileName
        return name ?
            getIpfsUrl(this.getV2Hash(), name) :
            getIpfsUrl(this.getV2Hash())
    }

    listFileNames(): string[] {
        return (
            this.isMultiple ? 
                this.fileNames : 
                (this.fileName && [ this.fileName ])
        ) || []
    }

    private checkFileName(fileName: string) {
        if (this.isMultiple) {
            if (!this.uploadResult.find(({path}: {path: string}) => path === fileName)) {
                throw Error(`File ${fileName} doesn't exists in this upload`)
            }
        } else {
            if (this.fileName !== fileName) {
                throw Error(`File ${fileName} doesn't exists in this upload`)
            }
        }
    }

    constructor({uploadResult, fileName, fileNames, wrappedWithDirectory}: IPFSUploadInterface) {
        if (!fileName && !fileNames) {
            throw new Error('fileName or fileNames required!')
        }
        this.uploadResult = uploadResult
        this.fileName = fileName
        this.fileNames = fileNames
        this.isMultiple = fileNames ? true : false
        this.wrappedWithDirectory = wrappedWithDirectory || false
    }
}