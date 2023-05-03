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
    Tbody,
    Tr,
    Td,
    TableContainer,
    IconButton
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
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
import { ArbitratorData } from "../../arbitrator/ArbitratorsList";
import { metaEvidenceTypes } from "./RegisterArbitratorDialog";

const ShowArbitratorDialog = () => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const { account, arbitratorRegistryContract, fee } = useAppContext()
    const [ arbitrator, setArbitrator ] = useState<ArbitratorData>()
    const [ loadedArbitratorData, setLoadedArbitratorData ] = useState<any>()

    const loadArbitrator = async () => {
        const result = await arbitratorRegistryContract.arbitrators(arbitrator?.id) 
        console.log(result)
        setLoadedArbitratorData(result)
    }

    useEffect(() => {
        setDialog('ShowArbitratorDialog', {...disclosure, setArbitrator: setArbitrator})
    }, [])

    useEffect(() => {
        setLoadedArbitratorData({})
        arbitrator && loadArbitrator()
    }, [arbitrator])

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
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                <Trans>Arbitrator {arbitrator?.name}</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody my={{base: "20px"}} width="100%">
                            <TableContainer>
                                <Table variant='simple'>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                                <Trans>Arbitrator's name:</Trans>
                                            </Td>
                                            <Td>
                                                { arbitrator?.name }
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Arbitrator's contract:</Trans>
                                            </Td>
                                            <Td>
                                                { arbitrator?.id }
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Supported operations:</Trans>
                                                <Box>
                                                    <IconButton
                                                        aria-label={t`Add`}
                                                        icon={<AddIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                    <IconButton
                                                        aria-label={t`Edit`}
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                    <IconButton
                                                        aria-label={t`Delete`}
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                </Box>
                                            </Td>
                                            <Td>
                                            {    
                                                arbitrator && arbitrator.operations?.length > 0 ? 
                                                    arbitrator.operations?.map((operation) => operation.operation) 
                                                        .map((value) => {
                                                            return <Badge variant='solid' colorScheme='blue'>
                                                                { metaEvidenceTypes.find(item => item.value === value.toString())?.label || t`unknown` }
                                                            </Badge>
                                                        }) : 
                                                <Badge variant='solid' colorScheme='blue'>
                                                    <Trans>All available</Trans>
                                                </Badge>
                                            }
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Supported collections:</Trans>
                                                <Box>
                                                    <IconButton
                                                        aria-label={t`Add`}
                                                        icon={<AddIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                    <IconButton
                                                        aria-label={t`Delete`}
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                </Box>
                                            </Td>
                                            <Td>
                                                {
                                                arbitrator && arbitrator.contracts?.length > 0 ? 
                                                    arbitrator.contracts.map((contract) => contract.contract) : 
                                                    t`Any`
                                                }
                                            </Td>
                                        </Tr>
                                        
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </CardBody>
                        
                        <CardFooter>
                            <Box w={{base: "60%", xs: "50%"}}>
                                <Button
                                    //onClick={ openDispute }
                                    variant="dark-outline"
                                >
                                    <Trans>Delete arbitrator</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ShowArbitratorDialog