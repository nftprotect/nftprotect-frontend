import React, { useEffect, useState } from 'react';
import {
    Button,
    Box,
    Image,
    Flex,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Container,
    Badge,
    Progress,
    List,
    ListItem,
    ListIcon,
    Textarea,
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
                                title && <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
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
                                                <Flex 
                                                    flexWrap="nowrap" 
                                                    alignItems="center" 
                                                    py={{base: "15px"}} 
                                                    px={{base: "20px"}} 
                                                    my={"1em"} 
                                                    border="1px dashed" 
                                                    borderColor="accent.light" 
                                                    borderRadius="16px"
                                                    width="100%"
                                                    backgroundColor={"lightgreen"}
                                                >
                                                    <Image src="/images/statusIcons/confirm.png" alt="Success" w={'3em'} pr={'1em'} />
                                                    <Flex flexDirection="column">
                                                        <Text textStyle="paragraph" color="muted">
                                                            <Link
                                                                href={ ipfsUpload.getCentralizedUrl(fileName) }
                                                            >
                                                                { fileName }
                                                            </Link>
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                                <FormControl isInvalid={form.errors[idx.toString()] && form.touched[idx.toString()]} mb={{base: "20px"}}>
                                                    <Input 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Describe the file…`}
                                                        //variant='primary' 
                                                        required
                                                    />
                                                    <FormErrorMessage>{form.errors[idx.toString()]}</FormErrorMessage>
                                                </FormControl>
                                            </>)}
                                        </Field>     
                                    </>
                                }) }
                            </>
                        </CardBody>

                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                <Button
                                    type="submit"
                                    variant="dark-outline"
                                    textTransform="uppercase"
                                    isDisabled={ !props.isValid }
                                >
                                    <Trans>Open dispute</Trans>
                                </Button>
                            </Box>
                            <Box w={{base: "60%", sm: "50%"}}>
                                <Button 
                                    onClick={goBack as any}
                                    variant="dark-outline"
                                >
                                    <Trans>Back</Trans>
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