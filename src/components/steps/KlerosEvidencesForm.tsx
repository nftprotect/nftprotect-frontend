import React, { useEffect, useState } from 'react';
import {
    Button,
    Box,
    Image,
    Flex,
    Text,
    FormControl,
    FormErrorMessage,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure,
    Input,
} from '@chakra-ui/react';
import { Form, Field, Formik } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { IPFSFileUpload } from '../IPFSFileUpload';
import { generateMetaEvidence, KlerosCourts } from '../../utils/kleros';
import IPFSUpload from '../../classes/IPFSUpload';
import { useIPFSContext } from '../../context/IPFSContextProvider';
import Link from 'next/link';

interface FormInitialData {
    onSubmit?: Function | undefined,
    goBack: Function,
    title?: string,
    evidenceData: EvidenceData,
    ipfsUpload: IPFSUpload,
}

export interface EvidenceJson extends EvidenceData {
    fileURI: string,
    files: {
        fileURI: string,
        description: string
    }[]
}

export interface EvidenceData {
    evidenceSide: number,
    name: string,
    description: string,
    protocolAddress?: string,
    
}

const KlerosEvidencesForm = ({
    onSubmit: outerOnSubmit, 
    goBack, 
    title,
    ipfsUpload,
    evidenceData,
}: FormInitialData) => {
    const { ipfs } = useIPFSContext()
    const fileNames = ipfsUpload.listFileNames()

    const onSubmit = (data:any) => {
        const evidence: EvidenceJson = {
            fileURI: ipfsUpload.getRelativeIPFSUrl(),
            ...evidenceData,
            files: fileNames.map((fileName: string, idx: number) => {
                return {
                    fileURI: ipfsUpload.getRelativeIPFSUrl(fileName),
                    description: data[idx.toString()]
                }
            })
        }
        console.log('EVIDENCE JSON:', evidence)
        uploadEvidence(evidence).then((result:IPFSUpload) => {
            outerOnSubmit && outerOnSubmit({
                data: evidence,
                upload: result
            })
        })
    }

    const uploadEvidence = async (evidence: any) => {
        const fileName = 'evidence.json'
        if (ipfs) {
            const result = await ipfs.add(
                {
                    path: fileName,
                    content: JSON.stringify(evidence)
                }, 
                {wrapWithDirectory: true}
            )
            return new IPFSUpload({
                uploadResult: result,
                fileName: fileName,
                wrappedWithDirectory: true
            })
        } else {
            throw Error('IPFS client not configured!')
        }
    }

    useEffect(() => {
        console.log('FILENAMES', fileNames)
    }, [fileNames])

    return (<>
        <Formik
            initialValues={{}}
            validateOnMount={true}
            onSubmit={(values, actions) => {
                onSubmit(values)
                setTimeout(() => {
                    actions.setSubmitting(false)
                }, 1000)
            }}
        >

            {(props) => (
                <Form onSubmit={props.handleSubmit}>
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                <Trans>Open dispute <br /> in Kleros</Trans>
                            </Text>
                            {
                                title && <Text textStyle="paragraph" textAlign="center" fontWeight="700">
                                    { title }
                                </Text>
                            }
                        </CardHeader>

                        <CardBody my={{base: "20px"}} w="100%">
                            <>
                                { fileNames.map(( fileName: string, idx: number ) => {
                                    return <>
                                        <Field 
                                            key={`field-${idx}`} 
                                            name={ idx.toString() } 
                                            validate={(value: string) => {
                                                if (!value) return t`Please fill the description`
                                            }}
                                        >
                                            {({ field, form }: any) => (<>
                                                <FormControl isInvalid={form.errors[idx.toString()] && form.touched[idx.toString()]} >
                                                    <Input 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Describe the file…`}
                                                        required
                                                        mb={{base: "10px"}}
                                                    />
                                                    <FormErrorMessage>{form.errors[idx.toString()]}</FormErrorMessage>
                                                </FormControl>
                                                <Flex 
                                                    flexWrap="nowrap" 
                                                    alignItems="center" 
                                                    py={{base: "16px"}} 
                                                    px={{base: "16px"}} 
                                                    border="1px dashed" 
                                                    borderColor="#53AC5A" 
                                                    borderRadius="3px"
                                                    width="100%"
                                                    backgroundColor="#EEFFEF"
                                                    mb={{base: "24px"}}
                                                >
                                                    <Image src="/images/statusIcons/confirm.png" alt="Success" w={'3em'} pr={'1em'} />
                                                    <Flex flexDirection="column">
                                                        <Text textStyle="paragraph" color="text.muted">
                                                            <Link
                                                                href={ ipfsUpload.getCentralizedUrl(fileName) }
                                                            >
                                                                { fileName }
                                                            </Link>
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </>)}
                                        </Field>
                                    </>
                                }) }
                            </>
                        </CardBody>

                        <CardFooter alignItems="center">
                            <Box w={{base: "60%", sm: "40%"}}>
                                <Button 
                                    onClick={goBack as any}
                                    variant="darkOutline"
                                >
                                    <Trans>Back</Trans>
                                </Button>
                            </Box>
                            <Box w={{base: "60%", sm: "40%"}}>
                                
                                <Button
                                    type="submit"
                                    variant="darkOutline"
                                    isDisabled={ !props.isValid }
                                >
                                    <Trans>Open dispute</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </Form>
            )}
        </Formik>
    </>)
}

export default KlerosEvidencesForm