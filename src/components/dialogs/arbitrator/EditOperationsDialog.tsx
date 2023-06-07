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
import CancelledStepContent from "../../steps/CancelledStepContent";
import ErrorStepContent from "../../steps/ErrorStepContent";
import TimeoutStepContent from "../../steps/TimeoutStepContent";
import { BigNumber } from '@ethersproject/bignumber';
import { handleContractError } from '../../../utils/errorHandling';
import { arrayify } from "@ethersproject/bytes";
import { getAddress } from "@ethersproject/address";
import { defaultAbiCoder } from "@ethersproject/abi";
import { ArbitratorData, Operation } from "../../arbitrator/ArbitratorsList";
import { metaEvidenceTypes } from "../../../utils/metaEvidence";

const EditOperationsDialog = ({
    setDisputeId: setDisputeIdExternal,
    arbitrator
}: {
    setDisputeId?: Function,
    arbitrator: ArbitratorData
}) => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ disputeId, setDisputeId ] = useState<BigNumber>()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [ submissionData, setSubmissionData ] = useState<any>()
    const { account, dynamicArbRegistryContract, fee } = useAppContext()

    // Naming of wizard step numbers
    enum StepMapping {
        start,
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
            console.log('ARBITRATOR UPDATE OPERATIONS TX', tx)
            // setDisputeId
            setNextStep(StepMapping.waitingForTransaction);
            dynamicArbRegistryContract.provider.once(tx.hash, (receipt) => {
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
            operations: arbitrator.operations?.map(({operation}) => defaultAbiCoder.encode(["uint8"],[operation])) || [],
            extraDatas: splitByLines(data.extraDatas).map((item: string) => arrayify(item)),
        }
        setSubmissionData(result)
        setNextStep(StepMapping.confirmTransaction)
    }

    const isExistingOperation = ({value}: {value: string}) => {
        const existingOperations = arbitrator.operations
        return existingOperations.find(exOp => exOp.operation === value) ? true : false
    }

    // Textarea input validation

    const validateExtraDatas = ({ values }: FormikProps<any>) => {
        return (value: string) => {
            let error
            if (!value) {
                error = t`ExtraData not specified`
            } else {
                const extraDatasLength = splitByLines(values.extraDatas)?.length
                const operationsLength = arbitrator.operations?.length
                console.log(values.operations)
                if (operationsLength > 0 && extraDatasLength !== operationsLength) {
                    error = t`Extra Datas must contain the same number of lines as Operations`
                }
            }
            return error
        }
    }

    const splitByLines = (str: string | undefined) => {
        return str?.trim()?.split('\n') || []
    }

    const fireAction = () => {
        if (submissionData) {
            setNextStep(StepMapping.confirmTransaction)
            try {
                dynamicArbRegistryContract.changeOperations(
                    arbitrator.id,
                    submissionData.operations,
                    submissionData.extraDatas
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
    }

    useEffect(() => {
        setDialog('EditOperationsDialog', disclosure)
    }, [])

    useEffect(() => {
        setNextStep(StepMapping.start)
        setSubmissionData(undefined)
        setDisputeId(undefined)
    }, [isOpen])

    useEffect(fireAction, [submissionData])

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
                                                    <Trans>{"Edit arbitrator's operations"}</Trans>
                                                </Text>
                                                <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                                    <Trans>Please specify new extraDatas for operations</Trans>
                                                </Text>
                                            </CardHeader>

                                            <CardBody my={{base: "20px"}} width="100%">
                                                <Field name='operations' >
                                                    {({ field, form }: any) => (
                                                        <FormControl isInvalid={form.errors.operations && form.touched.operations} mb={{base: "20px"}}>
                                                            <CheckboxGroup>    
                                                                <Wrap spacing="20px" justify="left">
                                                                    {metaEvidenceTypes.filter(option => isExistingOperation(option)).map((option) => (
                                                                        <WrapItem key={option.label} width={"45%"}>
                                                                            <Checkbox
                                                                                key={option.label}
                                                                                value={option.value}
                                                                                disabled
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
                                            </CardBody>

                                            <CardFooter flexDirection="column" alignItems="center">
                                                <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                                    <Button
                                                        type="submit"
                                                        variant="dark-outline"
                                                        textTransform="uppercase"
                                                        isDisabled={ !props.isValid }
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

                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                        <Trans>{"Edit arbitrator's operations"}</Trans>
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
                                        <Trans>{"Edit arbitrator's operations"}</Trans>
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
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Success</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="paragraph" mb={{base: "20px"}} letterSpacing="0.04em" textAlign="center" textTransform="uppercase">
                                        <Trans>Operations updated successfully!</Trans>
                                    </Text>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" textTransform="uppercase">
                                        <Trans>New extraData is set</Trans>
                                    </Text>
                                </CardBody>
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

export default EditOperationsDialog