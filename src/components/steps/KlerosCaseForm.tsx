import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { Form, Field, Formik } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { IPFSFileUpload } from '../IPFSFileUpload';
import IPFSUpload from '../../classes/IPFSUpload';

interface FormInitialData {
    onSubmit?: Function | undefined,
    onClose: Function,
    claimant: string,
    defendant: string,
    header: string,
    buttonText: string,
    title?: string,
    requireProtocolAddress?: boolean,
    children?: React.ReactNode
}

const KlerosCaseForm = ({
    onSubmit: outerOnSubmit, 
    onClose, 
    claimant,
    defendant,
    header,
    buttonText,
    title,
    requireProtocolAddress = false,
    children
}: FormInitialData) => {
    const [evidenceUpload, setEvidenceUpload] = useState<IPFSUpload>()

    const onSubmit = (data:any) => {
        const evidence = {
            fileURI: evidenceUpload?.getRelativeIPFSUrl(),
            ...data
        }
        outerOnSubmit && outerOnSubmit({
            data: evidence,
            upload: evidenceUpload
        })
    }

    // Textarea input validation
    function validateDescription(value: string) {
        let error
        if (!value) {
          error = <Trans>Description is required</Trans>
        }
        return error
    }

    function validateProtocolAddress(value: string) {
        let error
        if (!value) {
          error = <Trans>Protocol address is required</Trans>
        }
        return error
    }

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
                                { header }
                            </Text>
                            {
                                title && <Text textStyle="paragraph" textAlign="center" fontWeight="700">
                                    { title }
                                </Text>
                            }
                        </CardHeader>

                        <CardBody my={{base: "20px"}}>
                            <Field name='description' validate={validateDescription} >
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.description && form.touched.description} mb={{base: "20px"}}>
                                        <Textarea 
                                            type='text' 
                                            {...field} 
                                            placeholder={t`Describe the situation in details…`}
                                            variant='primary' resize="vertical"
                                        />
                                        <FormErrorMessage>{form.errors.description}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>

                            { requireProtocolAddress && <Field name='protocolAddress' validate={validateProtocolAddress} >
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.protocolAddress && form.touched.protocolAddress} mb={{base: "20px"}}>
                                        <Textarea 
                                            type='text' 
                                            {...field} 
                                            placeholder={t`Write the address of the protocol smart contract`}
                                            variant='primary' resize="vertical" 
                                            mb={{base: "20px"}} 
                                            isRequired 
                                            minH={{base: "38px" }}
                                        />
                                        <FormErrorMessage>{form.errors.protocolAddress}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>}

                            { children }
                            
                            <Box w="100%" mb={{base: "10px"}}>
                                <IPFSFileUpload returnUploadedFiles={ setEvidenceUpload }/>
                            </Box>
                        </CardBody>

                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                <Button
                                    type="submit"
                                    variant="darkOutline"
                                    isDisabled={ !props.isValid || !evidenceUpload }
                                >
                                    { buttonText }
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </Form>
            )}
        </Formik>
    </>)
}

export default KlerosCaseForm