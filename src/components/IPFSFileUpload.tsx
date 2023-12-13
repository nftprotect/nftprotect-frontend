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
import all from 'it-all'

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
    const { ipfs } = useIPFSContext()
    const [loading, setLoading] = useState<boolean>(false)
    const [loadedFiles, setLoadedFiles] = useState<File[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<IPFSUpload>()

    const uploadFile = async (files: File[]) => {
        if (!files) {
            console.error('No file attached')
            return
        }

        if (ipfs) {
            if (multiple) {
                const result = await all( ipfs.addAll(
                    Array.from(files).map((file: File) => {
                        return {
                            path: file.name,
                            content: file
                        }
                    }
                ), { wrapWithDirectory: true }))
                return {
                    fileNames: Array.from(files).map(file => file.name),
                    wrappedWithDirectory: true,
                    uploadResult: result
                }
            } else {
                const file = files[0]
                const result = await ipfs.add({
                    path: file.name,
                    content: file
                }, { wrapWithDirectory: true })
                return {
                    fileName: file.name,
                    wrappedWithDirectory: true,
                    uploadResult: result
                }
            }
        } else {
            throw Error('IPFS client not configured!')
        }
    }

    const setLoadedFilesWithFileName = (files: File|FileList) => {
        if (!multiple && files instanceof File) {
            if (fileName) {
                const blob = files.slice(0, files.size, files.type)
                const newFile = new File([blob], fileName, {type: files.type})
                setLoadedFiles([newFile])
            } else {
                setLoadedFiles([files])
            }
        } else if (files instanceof FileList) {
            setLoadedFiles([...loadedFiles, ...Array.from(files)]);
        }
    }

    const returnFileUrl = async () => {
        if (loadedFiles.length > 0) {
            setLoading(true)
            const result = await uploadFile(loadedFiles)
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