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
    Table,
    TableContainer,
    Tr,
    Td,
    Tbody,
    WrapItem,
    Wrap
} from '@chakra-ui/react';
import { Form, Field, Formik, FormikProps } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import IPFSUpload from "../../../classes/IPFSUpload";
import { IPFSFileUpload } from "../../IPFSFileUpload";
import { Wizard } from "react-use-wizard";
import SwitchableOutside from "../../wizardHelpers/SwitchableOutside";
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
import { ArbitratorRequest } from "../../arbitrator/ArbitratorRequestList";
import { metaEvidenceTypes } from "../../../utils/metaEvidence";
import { FormattedAddress } from "../../arbitrator/ArbitratorsList";
import { OperationBadge } from "../../arbitrator/ArbitratorsList";
import { MasterOperationBadge } from "../../arbitrator/ArbitratorRequestList";

interface LoadedRequestData {
    address: string,
    extraData: string[],
    contracts: string[],
    operations: string[]
}

const ShowRequestDialog = () => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const { account, dynamicArbRegistryContract, fee } = useAppContext()
    const [ request, setRequest ] = useState<ArbitratorRequest>()
    const [ loadedRequestData, setLoadedRequestData ] = useState<LoadedRequestData>()

    const loadRequest = async () => {
        const {
            arb,
            contracts,
            extraData,
            operations
        }: {
            arb: string,
            contracts: string,
            extraData: string[],
            operations: string
        } = await dynamicArbRegistryContract.getRequest(request?.id) 
        
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
                defaultAbiCoder.decode([`address[${contractsCount}]`], contracts)[0]:
                [],
            operations:  (contractsCount > 0) ?
                defaultAbiCoder.decode([`uint256[${operationsCount}]`], operations)[0]:
                []
        }
        setLoadedRequestData(parsedData)
    }

    useEffect(() => {
        setDialog('ShowRequestDialog', {...disclosure, setRequest})
    }, [])

    useEffect(() => {
        setLoadedRequestData(undefined)
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
                        bgColor: 'brand.light',
                    }
                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                <Trans>Request for arbitrator {request?.name}</Trans>
                            </Text>
                            <Text textStyle="paragraph" textAlign="center" fontWeight="700">
                                <Trans>{"Here's a complete description"}</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody my={{base: "20px"}} width="100%">
                            {!loadedRequestData && <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>}
                            {loadedRequestData && <TableContainer>
                                <Table variant='simple'>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                                <Trans>{"Arbitrator's name:"}</Trans>
                                            </Td>
                                            <Td>
                                                { request?.name }
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>{"Arbitrator's contract:"}</Trans>
                                            </Td>
                                            <Td>
                                                <FormattedAddress value={loadedRequestData.address} />
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Request type:</Trans>
                                            </Td>
                                            <Td>
                                                <MasterOperationBadge value={request?.operation || ''}/>
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Supported operations:</Trans>
                                            </Td>
                                            <Td>
                                                <Wrap justify="left">
                                                {    
                                                    loadedRequestData && loadedRequestData.operations?.length > 0 ? 
                                                        loadedRequestData.operations?.map((value) => {
                                                                return <WrapItem key={value} width={"auto"}>
                                                                    <OperationBadge value={value}/>
                                                                </WrapItem>
                                                            }) : 
                                                    <Badge variant='solid' colorScheme='blue'>
                                                        <Trans>All available</Trans>
                                                    </Badge>
                                                }
                                                </Wrap>
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Supported collections:</Trans>
                                            </Td>
                                            <Td>
                                                <Wrap spacing="20px" justify="left">
                                                    {loadedRequestData && loadedRequestData.contracts?.length > 0 ? 
                                                        loadedRequestData.contracts.map((contract) => {
                                                            return <WrapItem key={contract} width={"100%"}>
                                                                <FormattedAddress value={contract} />
                                                            </WrapItem>
                                                        }) : 
                                                        <Text><Trans>Any</Trans></Text>
                                                    }
                                                </Wrap>
                                            </Td>
                                        </Tr>
                                        
                                    </Tbody>
                                </Table>
                            </TableContainer>}
                        </CardBody>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ShowRequestDialog