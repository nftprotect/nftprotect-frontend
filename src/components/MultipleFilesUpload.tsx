import React, { useState } from 'react'
import { useIPFSContext } from '../context/IPFSContextProvider'
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Container,
    Badge,
    Progress,
    Button,
    List,
    ListItem,
    ListIcon,
    Input
  } from '@chakra-ui/react'
import { Form, Field, Formik } from 'formik'
import all from 'it-all'
import { Trans } from '@lingui/macro'

export const MultipleFilesUpload = ({ setUrl }:{ setUrl: Function }) => {
    const { ipfs, getCentralizedUrl } = useIPFSContext()
    const [files, setFiles] = useState<any[]>([])
    const [filesUrl, setFilesUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState(false)

    const uploadFiles = async (files: any[]) => {
        let fileObjectsArray = Array.from(files).map((file) => {
            return {
                path: file.name,
                content: file
            }
        })

        const results = await all(
            ipfs.addAll(fileObjectsArray, { wrapWithDirectory: true })
        )

        console.log(results)
        return results
    }

    const returnFilesUrl = async (e: any) => {
        setLoading(true)
        e.preventDefault()
        const results = await uploadFiles(files)
        const hash = results[results.length-1].cid.toV1().toString()
        const dirUrl = getCentralizedUrl(hash)
        setUrl(dirUrl)
        setFilesUrl(dirUrl)
        setLoading(false)
        setUploaded(true)
    }

    const filesAndUploadButton = () => {
        if (files.length !== 0) {
            if (!loading) {
                return (
                    <div>
                        {uploaded ? (
                            <h5>
                                <Trans>✅ Files Uploaded Successfully</Trans>
                                <br></br>
                                <a
                                    href={filesUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    {filesUrl}
                                </a>
                            </h5>
                        ) : (
                            <div>
                                <Button type='submit'>
                                <Trans>Upload Files</Trans>
                                </Button>

                                <List className='mb-3'>
                                    {Array.from(files).map((file) => {
                                        return (
                                            <ListItem
                                                as='li'
                                                key={file.name}
                                            >
                                                <div className='ms-2 me-auto'>
                                                    {file.name}
                                                </div>
                                                <Badge>
                                                    {file.size} kb
                                                </Badge>
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            </div>
                        )}
                    </div>
                )
            } else {
                return (
                    <Container>
                        <h4><Trans>Uploading Files</Trans></h4>
                        <Progress />
                        <h4><Trans>Please Wait...</Trans></h4>
                    </Container>
                )
            }
        }
    }

    return (
        <div>
            <Formik
                initialValues={{}}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        alert(JSON.stringify(values, null, 2))
                        actions.setSubmitting(false)
                    }, 1000)
                }}
            >
            {(props) => (
                <Form onSubmit={returnFilesUrl}>
                    <Field name='files' required>
                        {({ field, form }: any) => (
                        <FormControl isInvalid={form.errors.name && form.touched.name}>
                            <FormLabel>Files</FormLabel>
                            <Input 
                                type='file' 
                                multiple 
                                {...field} 
                                placeholder='files'
                                onChange={(e) => setFiles((e.target.files || []) as any[])}
                            />
                            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                        </FormControl>
                        )}
                    </Field>
                    {filesAndUploadButton()}
                </Form>
            )}
            </Formik>
        </div>
    )
}