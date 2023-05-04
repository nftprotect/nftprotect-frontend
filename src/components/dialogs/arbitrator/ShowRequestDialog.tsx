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
import { ArbitratorRequest } from "../../arbitrator/ArbitratorRequestList";
import { metaEvidenceTypes } from "./RegisterArbitratorDialog";
import { hexlify } from "@ethersproject/bytes";

const ShowRequestDialog = () => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const { account, arbitratorRegistryContract, fee } = useAppContext()
    const [ request, setRequest ] = useState<ArbitratorRequest>()
    const [ loadedRequestData, setLoadedRequestData ] = useState<any>()

    const loadRequest = async () => {
        const {
            arb,
            contracts,
            extraData,
            operations
        } = await arbitratorRegistryContract.getRequest(request?.id) 
        
        const countUint256 = (value: string) => {
            const data = value ? value.substring(2) : ""
            return data.length/64
        }

        const contractsCount = countUint256(contracts)
        const operationsCount = countUint256(operations)

        const parsedData = {
            address: arb,
            extraData: extraData,
            contracts: (contractsCount > 0) ?
                defaultAbiCoder.decode([`address[${contractsCount}]`], contracts):
                [],
            operations:  (contractsCount > 0) ?
                defaultAbiCoder.decode([`uint256[${operationsCount}]`], operations):
                []
        }
        console.log('PARSED DATA', parsedData)
        setLoadedRequestData(parsedData)
    }

    const loadOperations = () => {
        const supportedOperatons = metaEvidenceTypes.map(async (entry) => {
            return await arbitratorRegistryContract.checkArbitratorByOperation()
        })
    }

    useEffect(() => {
        setDialog('ShowRequestDialog', {...disclosure, setRequest})
    }, [])

    useEffect(() => {
        setLoadedRequestData({})
        request && loadRequest()
    }, [request])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
            onClose={() => {
                onClose()
            }}
            size={"xl"}
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
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                <Trans>Request to add {request?.name}</Trans>
                            </Text>
                            <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                <Trans>Here's a complete description</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody my={{base: "20px"}}>

                        </CardBody>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ShowRequestDialog