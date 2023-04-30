import { useEffect, useState } from "react"
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
    ModalCloseButton,
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
    Input,
    Textarea,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure,
} from '@chakra-ui/react';
import { Form, Field, Formik, FormikProps } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import IPFSUpload from "../../../classes/IPFSUpload";
import { IPFSFileUpload } from "../../IPFSFileUpload";

const RegisterArbitratorDialog = () => {
    const disclosure = useDisclosure()
    const { setDialog } = useCallableDialogContext()
    const [evidenceUpload, setEvidenceUpload] = useState<IPFSUpload>()

    useEffect(() => {
        setDialog('RegisterArbitratorDialog', disclosure)
    }, [])

    const onSubmit = (data:any) => {
        const result = {
            evidence: {
                description: 'The evidence of competencies',
                fileURI: evidenceUpload?.getRelativeIPFSUrl()
            },
            name: data.name,
            operations: splitByLines(data.operations),
            extraDatas: splitByLines(data.extraDatas),
            contractAddresses: splitByLines(data.contractAddresses)
        }
        //outerOnSubmit && outerOnSubmit(evidence)
    }

    // Textarea input validation
    const validateName = (value: string) => {
        let error
        if (!value) {
            error = t`Arbitrator name is required`
        }
        return error
    }

    const validateOperations = (value: string) => {
        let error
        // Do some check
        return error
    }

    const validateExtraDatas = ({ values }: FormikProps<any>) => {
        return (value: string) => {
            let error
            if (!value) {
                error = t`At least one extraData must be specified`
            } else {
                const extraDatasLength = splitByLines(values.extraDatas)?.length
                const operationsLength = splitByLines(values.operations)?.length
                if (extraDatasLength !== operationsLength) {
                    error = t`Extra Datas must contain the same number of lines as Operations`
                }
            }
            return error
        }
    }

    const validateContractAdresses = (value: string) => {
        let error
        // Do some check
        return error
    }

    const splitByLines = (str: string | undefined) => {
        return str?.trim()?.split('\n')
    }

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen} 
            onClose={() => {
                disclosure.onClose()
            }}
        >
            <ModalOverlay 
                bg='blackAlpha.700' 
                backdropFilter='blur(10px)' 
            />
            <ModalContent
                w={{base: "800px"}}
                sx={{
                    "::-webkit-scrollbar": {
                        w: "5px",
                    },
                    "::-webkit-scrollbar-track": {
                        my: '16px',
                        overflowY: "hidden"
                    },
                    "::-webkit-scrollbar-thumb": {
                        bgColor: 'accent.light',
                    }
                }}
            >
                <ModalCloseButton onClick={disclosure.onClose} />
                <ModalBody>
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
                                            <Trans>Register as arbitrator</Trans>
                                        </Text>
                                        {
                                            <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                                <Trans>Please fill the form to register</Trans>
                                            </Text>
                                        }
                                    </CardHeader>

                                    <CardBody my={{base: "20px"}}>
                                        <Field name='name' validate={validateName} >
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.name && form.touched.name} mb={{base: "20px"}}>
                                                    <Input 
                                                        variant='outline' 
                                                        resize="vertical" 
                                                        placeholder={ t`A name of your arbitartor`}
                                                        isRequired
                                                        {...field} 
                                                    />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Field name='operations' validate={validateOperations} >
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.operations && form.touched.operations} mb={{base: "20px"}}>
                                                    <Textarea 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Write a list of operations you can handle (each in a new line)`}
                                                        variant='primary' resize="vertical" 
                                                        mb={{base: "20px"}} 
                                                        minH={{base: "128px" }}
                                                    />
                                                    <FormErrorMessage>{form.errors.operations}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Field name='extraDatas' validate={validateExtraDatas(props)} >
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.extraDatas && form.touched.extraDatas} mb={{base: "20px"}}>
                                                    <Textarea 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Write your extraData for every supported operation (each in a new line)`}
                                                        variant='primary' resize="vertical" 
                                                        mb={{base: "20px"}}
                                                        required
                                                        minH={{base: "128px" }}
                                                    />
                                                    <FormErrorMessage>{form.errors.extraDatas}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Field name='contractAdresses' validate={validateContractAdresses} >
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.contractAdresses && form.touched.contractAdresses} mb={{base: "20px"}}>
                                                    <Textarea 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Write your supported contractAdresses (each in a new line)`}
                                                        variant='primary' resize="vertical" 
                                                        mb={{base: "20px"}} 
                                                        minH={{base: "128px" }}
                                                    />
                                                    <FormErrorMessage>{form.errors.contractAdresses}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Box w="100%">
                                            { evidenceUpload && evidenceUpload.fileName }
                                            <IPFSFileUpload returnUploadedFile={ setEvidenceUpload }/>
                                        </Box>

                                        <Flex flexWrap="nowrap" alignItems="center" mt={{base: "8px"}} mb={{base: "10px"}}>
                                            <Box color="#2D7BD6" mr={[2]}>
                                                <Info fontSize='20px' />
                                            </Box>
                                            <Text textStyle="paragraph" color="muted">
                                                <Trans>You can add an external file in PDF or add multiple files in a single .zip file.</Trans>
                                            </Text>
                                        </Flex>
                                    </CardBody>

                                    <CardFooter flexDirection="column" alignItems="center">
                                        <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                            <Button
                                                type="submit"
                                                variant="dark-outline"
                                                textTransform="uppercase"
                                                isDisabled={ !props.isValid || !evidenceUpload }
                                            >
                                                <Trans>Register</Trans>
                                            </Button>
                                        </Box>
                                        <Box w={{base: "60%", sm: "50%"}}>
                                            <Button 
                                                onClick={ disclosure.onClose }
                                                variant="dark-outline"
                                            >
                                                Close
                                            </Button>
                                        </Box>
                                    </CardFooter>
                                </Card>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default RegisterArbitratorDialog