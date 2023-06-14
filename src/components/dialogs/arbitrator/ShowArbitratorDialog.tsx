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
    IconButton,
    Wrap,
    WrapItem
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
import AddOperationsDialog from "./AddOperationsDialog";
import EditOperationsDialog from "./EditOperationsDialog";
import AddContractsDialog from "./AddContractsDialog";
import DeleteArbitratorDialog from "./DeleteArbitratorDialog";
import { OperationBadge, FormattedAddress } from "../../arbitrator/ArbitratorsList";
import { formatAddress } from "../../../utils/helpers";
import RemoveOperationsDialog from "./RemoveOperationsDialog";

const ShowArbitratorDialog = () => {
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const { account, dynamicArbRegistryContract, fee } = useAppContext()
    const [ arbitrator, setArbitrator ] = useState<ArbitratorData>()
    const [ loadedArbitratorData, setLoadedArbitratorData ] = useState<any>()
    const { getDialog } = useCallableDialogContext()

    useEffect(() => {
        setDialog('ShowArbitratorDialog', {...disclosure, setArbitrator: setArbitrator})
    }, [])

    useEffect(() => {
        setLoadedArbitratorData({})
    }, [arbitrator])

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
                                <Trans>Arbitrator {arbitrator?.name}</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody my={{base: "20px"}} width="100%">
                            <TableContainer>
                                <Table variant='simple'>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                                <Trans>{"Arbitrator's name:"}</Trans>
                                            </Td>
                                            <Td>
                                                { arbitrator?.name }
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>{"Arbitrator's contract:"}</Trans>
                                            </Td>
                                            <Td>
                                                <FormattedAddress value={arbitrator?.id || ''} />
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Trans>Supported operations:</Trans>
                                                { arbitrator && arbitrator.operations?.length > 0 && <Box>
                                                    <IconButton
                                                        aria-label={t`Add`}
                                                        icon={<AddIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                        onClick={ () => { getDialog('AddOperationsDialog').onOpen() }}
                                                    />
                                                    <IconButton
                                                        aria-label={t`Edit`}
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                        onClick={ () => { getDialog('EditOperationsDialog').onOpen() }}
                                                    />
                                                    <IconButton
                                                        aria-label={t`Delete`}
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                        onClick={ () => { getDialog('RemoveOperationsDialog').onOpen() }}
                                                    />
                                                </Box> }
                                            </Td>
                                            <Td>
                                                <Wrap justify="left">
                                                {    
                                                    arbitrator && arbitrator.operations?.length > 0 ? 
                                                        arbitrator.operations?.map((operation) => operation.operation) 
                                                            .map((value) => {
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
                                                { arbitrator && arbitrator.contracts?.length > 0 && <Box>
                                                    <IconButton
                                                        aria-label={t`Add`}
                                                        icon={<AddIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                        onClick={ () => { getDialog('AddContractsDialog').onOpen() }}
                                                    />
                                                    <IconButton
                                                        aria-label={t`Delete`}
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        width={"auto"}
                                                        variant="outline"
                                                    />
                                                </Box> }
                                            </Td>
                                            <Td>
                                                <Wrap spacing="20px" justify="left">
                                                    {arbitrator && arbitrator.contracts?.length > 0 ? 
                                                        arbitrator.contracts.map((contract) => {
                                                            return <WrapItem key={contract.contract} width={"100%"}>
                                                                <FormattedAddress value={contract.contract} />
                                                            </WrapItem>
                                                        }) : 
                                                        <Text><Trans>Any</Trans></Text>
                                                    }
                                                </Wrap>
                                            </Td>
                                        </Tr>
                                        
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </CardBody>
                        
                        <CardFooter>
                            <Box w={{base: "60%", xs: "50%"}}>
                                <Button
                                    onClick={ () => { getDialog('DeleteArbitratorDialog').onOpen() }}
                                    variant="darkOutline"
                                >
                                    <Trans>Delete arbitrator</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>

        { /** Dialogs used on this page */ }
        { arbitrator && <AddOperationsDialog arbitrator={arbitrator}/> }
        { arbitrator && <AddContractsDialog arbitrator={arbitrator}/> }
        { arbitrator && <EditOperationsDialog arbitrator={arbitrator}/> }
        { arbitrator && <RemoveOperationsDialog arbitrator={arbitrator}/>}
        { arbitrator && <DeleteArbitratorDialog arbitrator={arbitrator}/>}
    </>)
}

export default ShowArbitratorDialog