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
import { ArbitratorData } from "../../arbitrator/ArbitratorsList";
import { metaEvidenceTypes } from "../../../utils/metaEvidence";

const RemoveOperationsDialog = ({
    arbitrator,
}: {
    arbitrator: ArbitratorData
}) => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
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
            console.log('OPERATIONS REMOVING TX', tx)
            setNextStep(StepMapping.waitingForTransaction);
            dynamicArbRegistryContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
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
            operations: data.operations?.map((item: string) => defaultAbiCoder.encode(["uint8"],[item])) || [],
        }
        fireAction(result)
    }

    const fireAction = ({ operations }: any) => {
        setNextStep(StepMapping.confirmTransaction)
        try {
            dynamicArbRegistryContract.removeOperations(
                arbitrator.id,
                operations
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

    const validateOperations = (value: string[]) => {
        // if (!value || value?.length === 0) {
        //     return t`Choose operations to remove`
        // }
    }
    const isExistingOperation = ({value}: {value: string}) => {
        const existingOperations = arbitrator.operations
        return existingOperations.find(exOp => exOp.operation === value) ? true : false
    }

    useEffect(() => {
        setDialog('RemoveOperationsDialog', disclosure)
    }, [])

    useEffect(() => {
        setNextStep(StepMapping.start)
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
                        bgColor: 'brand.light',
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
                                                    <Trans>{"Remove arbitrator's operations"}</Trans>
                                                </Text>
                                                <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                                    <Trans>Please check operations you want to remove</Trans>
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

                                            </CardBody>

                                            <CardFooter flexDirection="column" alignItems="center">
                                                <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                                    <Button
                                                        type="submit"
                                                        variant="darkOutline"
                                                        textTransform="uppercase"
                                                        isDisabled={ !props.isValid }
                                                    >
                                                        <Trans>Remove operations</Trans>
                                                    </Button>
                                                </Box>
                                                <Box w={{base: "60%", sm: "50%"}}>
                                                    <Button 
                                                        onClick={ onClose }
                                                        variant="darkOutline"
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
                                        <Trans>{"Remove arbitrator's operations"}</Trans>
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
                                        <Trans>{"Remove arbitrator's operations"}</Trans>
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

                        {/* Success */}
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
                                        <Trans>Operations removed successfully!</Trans>
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

export default RemoveOperationsDialog