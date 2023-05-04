import { useEffect, useState } from "react"
import {
    CheckboxGroup,
    Checkbox,
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
    Link,
    Input,
    Textarea,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import { Form, Field, Formik, FormikProps } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import IPFSUpload from "../../../classes/IPFSUpload";
import { IPFSFileUpload } from "../../IPFSFileUpload";
import { Wizard } from "react-use-wizard";
import SwitchableOutside from "../../wizardHelpers/SwitchableOutside";
import { dialogsTimeout } from "../../../utils/config";
import { useAppContext } from "../../../context/AppContextProvider";
import { formatEther, parseEther } from "@ethersproject/units";
import { isAddress } from "@ethersproject/address";
import CancelledStepContent from "../../nftView/nftButtons/steps/CancelledStepContent";
import ErrorStepContent from "../../nftView/nftButtons/steps/ErrorStepContent";
import TimeoutStepContent from "../../nftView/nftButtons/steps/TimeoutStepContent";
import { BigNumber } from '@ethersproject/bignumber';
import { handleContractError } from '../../../utils/errorHandling';
import { arrayify } from "@ethersproject/bytes";
import { getAddress } from "@ethersproject/address";
import { defaultAbiCoder } from "@ethersproject/abi";
import { ArbitratorData, Operation } from "../../arbitrator/ArbitratorsList";
import { metaEvidenceTypes } from "./RegisterArbitratorDialog";

const AddOperationsDialog = ({
    setDisputeId: setDisputeIdExternal,
    arbitrator
}: {
    setDisputeId?: Function,
    arbitrator: ArbitratorData
}) => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ evidenceUpload, setEvidenceUpload ] = useState<IPFSUpload>()
    const [ disputeId, setDisputeId ] = useState<BigNumber>()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [ submissionData, setSubmissionData ] = useState<any>()
    const { account, arbitratorRegistryContract, fee } = useAppContext()

    const DISPUTE_PRICE = '0.1'

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        payArbitrationFee,
        confirmTransaction,
        waitingForTransaction,
        success,
        canceled,
        error,
        timeout
    }

    const handleUnknownError = (error: any) => {
        console.log({err: error})
        setNextStep(StepMapping.error)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(onClose, dialogsTimeout)
    }

    const finalTransactionSent = () => {
        return (tx: any) => {
            console.log('ARBITRATOR ADD OPERATIONS TX', tx)
            // setDisputeId
            setNextStep(StepMapping.waitingForTransaction);
            arbitratorRegistryContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setDisputeIdExternal && setDisputeIdExternal(disputeId)
                    setNextStep(StepMapping.success)
                    console.log("Transaction successful", tx.hash);
                    setTimeout(onClose, dialogsTimeout)
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const onSubmit = (data:any) => {
        const result = {
            evidence: {
                description: 'The evidence of competencies',
                fileURI: evidenceUpload?.getRelativeIPFSUrl()
            },
            operations: data.operations?.map((item: string) => defaultAbiCoder.encode(["uint8"],[item])) || [],
            extraDatas: splitByLines(data.extraDatas).map((item: string) => arrayify(item)),
        }
        setSubmissionData(result)
        setNextStep(StepMapping.payArbitrationFee)
    }

    const isExistingOperation = ({value}: {value: string}) => {
        const existingOperations = arbitrator.operations
        return existingOperations.find(exOp => exOp.operation === value) ? true : false
    }

    // Textarea input validation

    const validateOperations = (value: string[]) => {
        let error
        if (value && value.length === 0) {
            error = t`You have to choose at least one operation`
        }
        // Do some check
        return error
    }

    const validateExtraDatas = ({ values }: FormikProps<any>) => {
        return (value: string) => {
            let error
            if (!value) {
                error = t`ExtraData not specified`
            } else {
                const extraDatasLength = splitByLines(values.extraDatas)?.length
                const operationsLength = values.operations?.length
                console.log(values.operations)
                if (extraDatasLength !== operationsLength) {
                    error = t`Extra Datas must contain the same number of lines as Operations`
                }
            }
            return error
        }
    }

    const splitByLines = (str: string | undefined) => {
        return str?.trim()?.split('\n') || []
    }

    const openDispute = () => {
        setNextStep(StepMapping.confirmTransaction)
        try {
            arbitratorRegistryContract.addOperations(
                arbitrator.id,
                submissionData.operations,
                submissionData.extraDatas,
                submissionData.evidence.fileURI, 
                {
                    value: parseEther(DISPUTE_PRICE),
                }
            )
                .then( finalTransactionSent() )
                .catch( 
                    handleContractError({
                        'ACTION_REJECTED': handleRejected,
                        default: handleUnknownError
                    }) 
                )
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    useEffect(() => {
        setDialog('AddOperationsDialog', disclosure)
    }, [])

    useEffect(() => {
        setNextStep(StepMapping.start)
        setEvidenceUpload(undefined)
        setSubmissionData(undefined)
        setDisputeId(undefined)
    }, [isOpen])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
            onClose={() => {
                onClose()
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
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
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

                                {(props: FormikProps<any>) => (
                                    <Form onSubmit={props.handleSubmit}>
                                        <Card variant="stepContent">
                                            <CardHeader>
                                                <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                                    <Trans>Add operations to arbitrator</Trans>
                                                </Text>
                                                <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                                    <Trans>Please fill the form to add operations</Trans>
                                                </Text>
                                            </CardHeader>

                                            <CardBody my={{base: "20px"}}>
                                                <Field name='operations' validate={validateOperations} >
                                                    {({ field, form }: any) => (
                                                        <FormControl isInvalid={form.errors.operations && form.touched.operations} mb={{base: "20px"}}>
                                                            <CheckboxGroup 
                                                                defaultValue={[]}
                                                                onChange={(value: string[]) => {
                                                                    const operations = value.map(
                                                                        (value: string) => BigNumber.from(value)
                                                                    ).sort()
                                                                    props.setValues({ ...props.values, operations })
                                                                }}
                                                            >    
                                                                <Wrap spacing="20px" justify="left">
                                                                    {metaEvidenceTypes.map((option) => (
                                                                        <WrapItem key={option.label} width={"45%"}>
                                                                            <Checkbox
                                                                                key={option.label}
                                                                                value={option.value}
                                                                                disabled={isExistingOperation(option)}
                                                                                defaultChecked={isExistingOperation(option)}
                                                                            >
                                                                                {option.label}
                                                                            </Checkbox>
                                                                        </WrapItem>
                                                                    ))}
                                                                </Wrap>
                                                            </CheckboxGroup>
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
                                                        <Trans>Submit</Trans>
                                                    </Button>
                                                </Box>
                                                <Box w={{base: "60%", sm: "50%"}}>
                                                    <Button 
                                                        onClick={ onClose }
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
                        </SwitchableOutside>
                        
                        {/* payArbitrationFee */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                            <Trans>Add operations to arbitrator</Trans>
                                        </Text>
                                    </CardHeader>
                                    
                                    <CardBody mb={{base: "20px"}}>
                                        <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center">
                                            <Trans>The final step is to pay for the arbitration fees.</Trans>
                                        </Text>
                                        
                                        <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center">
                                            <Trans>The fee for dispute resolution is</Trans>
                                        </Text>

                                        <Text fontSize={{base: "36px"}} textAlign="center" textTransform="uppercase">
                                            {"Ξ"}{ DISPUTE_PRICE } 
                                        </Text>
                                    </CardBody>
                                </Flex>

                                <CardFooter>
                                    <Box w={{base: "60%", xs: "50%"}}>
                                        <Button
                                            onClick={ openDispute }
                                            variant="dark-outline"
                                        >
                                            <Trans>Pay the dispute</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                        <Trans>Add operations to arbitrator</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                    <Text textStyle="paragraph" textTransform="uppercase">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Waiting for transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                        <Trans>Add operations to arbitrator</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                        <Text textStyle="paragraph" textTransform="uppercase">
                                            <Trans>{"Wait for transaction to confirm…"}</Trans>
                                        </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Sucess */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "360px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Your submission sent</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody>
                                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                            <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                            <Trans>If you{'\u0027'}ve missed including any evidences, you have up to 48 hours to add additional evidence to your dispute while the evidence collection phase is still ongoing via the provided link</Trans>
                                        </Text>
                                        
                                        <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer">
                                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                                <Trans>case</Trans>{` ${disputeId}`}
                                            </Text>
                                        </Link>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                            <Trans>Follow the status of the dispute through our app or on the website Kleros.</Trans>
                                        </Text>
                                        
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Transaction canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <CancelledStepContent/>
                        </SwitchableOutside>

                        {/* Error occured */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <ErrorStepContent/>
                        </SwitchableOutside>

                        {/* Transaction timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <TimeoutStepContent/>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default AddOperationsDialog