import React, { useEffect, useState } from 'react'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { FileUploader } from "react-drag-drop-files";
import {
    Box,
    Image,
    Text,
    Flex,
    Spinner
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import IPFSUpload from '../classes/IPFSUpload';
import all from 'it-all';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';


interface UploaderInitialData {
    multiple?: boolean,
    returnLoadedFiles?: Function,
    returnUploadedFiles?: Function,
    fileTypes?: Array<string>,
    fileName?: string
}

const defaultFileTypes = ["JPG", "JPEG", "PNG", "GIF", "PDF", "RTF", "JSON", "DOCX", "DOC", "XLS", "XLSX", "ZIP", "RAR"];

export const IPFSFileUpload = ({
    multiple = true,
    returnLoadedFiles, 
    returnUploadedFiles, 
    fileTypes,
    fileName // you can set uploaded file name for single file upload
} : UploaderInitialData ) => {
    // const { ipfs } = useIPFSContext()
    //const { helia, isOnline } = useIPFSContext()
    const [loading, setLoading] = useState<boolean>(false)
    const [loadedFiles, setLoadedFiles] = useState<File|FileList>()
    const [uploadedFiles, setUploadedFiles] = useState<IPFSUpload>()

    const uploadFile = async (files: File|FileList) => {
        if (!files) {
            console.error('No file attached')
            return
        }
        const helia = await createHelia()
    
        if (helia) {
            const fs = unixfs(helia)
            let result
            let wrappedWithDirectory = false
    
            if (multiple) {
                files = files as FileList
                const fileEntries = await Promise.all(
                    Array.from(files).map(async (file: File) => {
                        const fileContent = await file.arrayBuffer()
                        return {
                            path: file.name,
                            content: new Uint8Array(fileContent)
                        }
                    })
                )
                result = []
                for await (const entry of fs.addAll(fileEntries, { wrapWithDirectory: true })) {
                    result.push(entry)
                }
                wrappedWithDirectory = true
            } else {
                const file = files as File
                const fileContent = await file.arrayBuffer()
                const cid = await fs.addBytes(new Uint8Array(fileContent))
                result = {
                    cid
                }
            }
            console.log('UPLOAD RESULT RAW', result)
            let fileNames: string[];
            if (files instanceof File) {
                fileNames = [files.name];
            } else {
                fileNames = Array.from(files).map(file => file.name);
            }
    
            return {
                fileNames,
                wrappedWithDirectory,
                uploadResult: result
            }
        } else {
            throw Error('Helia client not configured!')
        }
    }

    const setLoadedFilesWithFileName = (files: File|FileList) => {
        if (!multiple && fileName) {
            if (files instanceof File) {
                const blob = files.slice(0, files.size, files.type)
                const newFile = new File([blob], fileName, {type: files.type})
                setLoadedFiles(newFile)
            }
        } else {
            setLoadedFiles(files)
        }
    }

    const returnFileUrl = async () => {
        if (loadedFiles) {
            setLoading(true)
            const result = await uploadFile(loadedFiles)
            console.log('UPLOAD RESULT', result)
            if (result) {
                const ipfsUpload = new IPFSUpload(result)
                setUploadedFiles(ipfsUpload)
                setLoading(false)
                // return upload data
                returnUploadedFiles && returnUploadedFiles(ipfsUpload)
            }
        }
    }

    useEffect(() => {
        // return file object loaded to uploader
        returnLoadedFiles && returnLoadedFiles(loadedFiles)
        // and start uploading
        returnFileUrl()
    }, [loadedFiles])

    return <>
            <FileUploader 
                handleChange={setLoadedFilesWithFileName}
                name="file"
                types={fileTypes || defaultFileTypes}
                multiple={multiple}
                fileOrFiles={null}
            >
                <Flex bgColor="#F5F1FF" border="1px dashed" borderColor="brand.light" borderRadius="3px" alignItems="center" justifyContent="center" cursor="pointer" mb={{base: "10px"}}>
                    { loading && <Spinner variant="primary" speed='0.65s' my={{base: "10px"}} w="1.5em" h="1.5em" /> }
                    { !loading && <DownloadIcon my={{base: "10px"}} fontSize="24px" color="brand.light" />}
                    
                </Flex>
                { uploadedFiles && uploadedFiles.listFileNames().map((item) => {
                    return <p key={item}>{ item }</p>
                }) }
            </FileUploader>
        </>
}