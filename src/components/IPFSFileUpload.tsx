import React, { useEffect, useState } from 'react'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { FileUploader } from "react-drag-drop-files";
import {
    Box,
    Flex,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'

interface UploaderInitialData {
    setUrl?: Function | undefined,
    setIpfsUrl?: Function | undefined
}

export const IPFSFileUpload = ({ setUrl, setIpfsUrl }:UploaderInitialData) => {
    const { ipfs, getCentralizedUrl, getIpfsUrl } = useIPFSContext()
    const [file, setFile] = useState<any>()
    const [fileUrl, setFileUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const fileTypes = ["JPG", "PNG", "GIF", "PDF", "RTF"];

    const uploadFile = async (file: any) => {
        if (!file) {
            console.error('No file attached')
            return
        }

        const result = await ipfs.add({
            path: file.name,
            content: file
        }, {wrapWithDirectory: true})

        return {
            fileName: file.name,
            uploadResult: result
        }
    }

    const returnFileUrl = async () => {
        setLoading(true)
        const result = await uploadFile(file)
        if (result) {
            const dirHash = result.uploadResult.cid.toString()//.toV1().toString()
            const dirUrl = getCentralizedUrl(dirHash)
            const fileIPFSUrl = getIpfsUrl(result.uploadResult.cid.toString(), result.fileName)

            setUrl && setUrl(dirUrl)
            setIpfsUrl && setIpfsUrl(fileIPFSUrl)
            setFileUrl(dirUrl)
            setLoading(false)
            setUploaded(true)
        }
    }

    useEffect(() => {
        returnFileUrl()
    }, [file])

    return (
        <FileUploader 
            handleChange={setFile} 
            name="file" 
            types={fileTypes}
        >
            <Flex bgColor="#F0F9FF" border="1px dashed #009AFF" borderRadius="3px" alignItems="center" justifyContent="center">
                <DownloadIcon my={["20px"]} fontSize="24px" color="#009AFF" />
            </Flex>
        </FileUploader>
    )
}