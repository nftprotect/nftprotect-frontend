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

const DeleteArbitratorDialog = ({
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
            console.log('ARBITRATOR DELETION TX', tx)
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

    const fireAction = () => {
        setNextStep(StepMapping.confirmTransaction)
        try {
            dynamicArbRegistryContract.deleteArbitrator(
                arbitrator.id
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
        setDialog('DeleteArbitratorDialog', disclosure)
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
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                        <Trans>Delete arbitrator</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody my={{base: "20px"}}>
                                    <Text textStyle="paragraph">
                                        <Trans>Are you sure to delete arbitrator?</Trans>
                                    </Text>
                                    <Text textStyle="paragraph">
                                        { arbitrator.name }
                                    </Text>
                                </CardBody>

                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                        <Button 
                                            onClick={ fireAction }
                                            variant="darkOutline"
                                        >
                                            <Trans>Delete arbitrator</Trans>
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
                                        <Trans>Delete arbitrator</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                    <Text textStyle="paragraph">
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
                                        <Trans>Delete arbitrator</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                        <Text textStyle="paragraph">
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
                                    <Text textStyle="paragraph" mb={{base: "20px"}} letterSpacing="0.04em" textAlign="center">
                                        <Trans>Arbitrator deleted successfully!</Trans>
                                    </Text>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center">
                                        <Trans>{"New cases won't be opened with this arbitrator"}</Trans>
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

export default DeleteArbitratorDialog