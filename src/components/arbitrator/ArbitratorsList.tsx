import { 
    TableContainer, 
    Table, 
    Tr,
    Td,
    Thead,
    Tbody,
    Tfoot,
    TableCaption,
    Th,
    Badge,
    Flex,
    Text,
    Box
} from "@chakra-ui/react"
import { Trans, t } from "@lingui/macro"
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"
import { metaEvidenceTypes } from "../dialogs/arbitrator/RegisterArbitratorDialog"
import Davatar from '@davatar/react'

export interface Operation {
    id: string,
    operation: string,
    extraData: string
}

export interface ArbitratorData {
    id: string,
    name: string,
    manager?: string,
    operations: Operation[],
    contracts: ContractData[],
}

export interface ContractData {
    id: string,
    contract: string,
    arbitrator?: string
}

const ArbitratorsList = ({arbitrators}: {
    arbitrators: ArbitratorData[]
}) => {

    const { getDialog } = useCallableDialogContext()

    return (
        <>        
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th><Trans>Name</Trans></Th>
                            <Th><Trans>Address</Trans></Th>
                            <Th><Trans>Cases admissible for arbitration</Trans></Th>
                            <Th><Trans>Supported contracts</Trans></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            arbitrators.map((arbitrator) => {
                                return  <Tr key={`arb${arbitrator.id}`} onClick={() => {
                                    const dialog = getDialog('ShowArbitratorDialog')
                                    dialog.setArbitrator(arbitrator)
                                    dialog.onOpen()
                                }}>
                                    <Td>
                                        <Flex alignItems={"center"}>
                                            <Box mr="0.8em">
                                                <Davatar
                                                    size={32}
                                                    address={arbitrator.id}
                                                    generatedAvatarType='jazzicon'
                                                />
                                            </Box>
                                            <Box>
                                            <Text>
                                                {arbitrator.name}
                                            </Text>
                                            </Box>
                                        </Flex>
                                    </Td>
                                    <Td>{arbitrator.id}</Td>
                                    <Td>{    
                                        arbitrator.operations?.length > 0 ? 
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
                                    <Td>{
                                        arbitrator.contracts?.length > 0 ? 
                                            arbitrator.contracts.map((contract) => contract.contract) : 
                                            t`Any`
                                        }
                                    </Td>
                                </Tr>
                            })
                        }
                    </Tbody>
                    {/* <Tfoot>
                        <Tr>
                            <Th><Trans>Arbitrator</Trans></Th>
                            <Th><Trans>Operation</Trans></Th>
                            <Th><Trans>Dispute</Trans></Th>
                        </Tr>
                    </Tfoot> */}
                </Table>
            </TableContainer>
        </>
    )
}

export default ArbitratorsList