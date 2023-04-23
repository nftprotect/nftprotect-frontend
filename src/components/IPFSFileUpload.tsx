import React, { useEffect, useState } from 'react'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { FileUploader } from "react-drag-drop-files";
import {
    Box,
    Flex,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import IPFSUpload from '../classes/IPFSUpload';

interface UploaderInitialData {
    returnLoadedFile?: Function,
    returnUploadedFile?: Function
}

export const IPFSFileUpload = ({ returnLoadedFile, returnUploadedFile }:UploaderInitialData) => {
    const { ipfs } = useIPFSContext()
    const [loadedFile, setLoadedFile] = useState<any>()
    const [uploadedFile, setUploadedFile] = useState<IPFSUpload>()
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const fileTypes = ["JPG", "PNG", "GIF", "PDF", "RTF"];

    const uploadFile = async (file: any) => {
        if (!file) {
            console.error('No file attached')
            return
        }

        if (ipfs) {
            const result = await ipfs.add({
                path: file.name,
                content: file
            }, {wrapWithDirectory: true})

            return {
                fileName: file.name,
                wrappedWithDirectory: true,
                uploadResult: result
            }
        } else {
            throw Error('IPFS client not configured!')
        }
    }

    const returnFileUrl = async () => {
        setLoading(true)
        const result = await uploadFile(loadedFile)
        if (result) {
            const ipfsUpload = new IPFSUpload(result)
            setUploadedFile(ipfsUpload)
            setLoading(false)
            setUploaded(true)
            // return upload data
            returnUploadedFile && returnUploadedFile(ipfsUpload)
        }
    }

    useEffect(() => {
        // return file object loaded to uploader
        returnLoadedFile && returnLoadedFile(loadedFile)
        // and start uploading
        returnFileUrl()
    }, [loadedFile])

    return <FileUploader 
                handleChange={setLoadedFile} 
                name="file"
                types={fileTypes}
            >
                <Flex bgColor="#F5F1FF" border="1px dashed" borderColor="accent.light" borderRadius="3px" alignItems="center" justifyContent="center" cursor="pointer">
                        <DownloadIcon my={{base: "10px"}} fontSize="24px" color="accent.light" />
                    </Flex>
            </FileUploader>
}