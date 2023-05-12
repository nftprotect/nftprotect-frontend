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
    Box,
    Wrap,
    WrapItem,
    IconButton,
    Link,
    VisuallyHiddenInput
} from "@chakra-ui/react"
import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons"
import { Trans, t } from "@lingui/macro"
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"
import { metaEvidenceTypes } from "../../utils/metaEvidence"
import Davatar from '@davatar/react'
import { formatAddress, generateUUID, copyTextToClipboard } from "../../utils/helpers"

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

export const OperationBadge = ({value} : {value: string}) => {
    return <Badge variant='solid' colorScheme='blue' px={'0.5rem'} mx={'0.3rem'}>
        { metaEvidenceTypes.find(item => item.value === value.toString())?.label || t`unknown` }
    </Badge>
}

export const FormattedAddress = ({
    value, 
    withLink = true,
    withCopy = false
} : {
    value: string, 
    withLink?: boolean, 
    withCopy?: boolean
}) => {
    const uuid = generateUUID()
    return <Flex flexDirection={'row'}>
        <Text>{ formatAddress(value, 4) }</Text>
        {withCopy && <>
            <VisuallyHiddenInput id={uuid} value={value} readOnly/>
            <Link 
                onClick={ () => {
                    copyTextToClipboard(value, '#'+uuid).then(() => alert('Copied!'))
                } } 
                title={t`Copy`}
                pl={"0.5em"}
            >
                <CopyIcon />
            </Link>
        </>}
        {withLink && <Link 
            href={"https://goerli.etherscan.io/address/"+value} 
            title={t`View on Etherscan`}
            target="_blank" 
            rel="noopener noreferrer"
            pl={"0.5em"}
        >
            <ExternalLinkIcon/>
        </Link>}
    </Flex>
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
                                return  <Tr key={`arb${arbitrator.id}`}>
                                    <Td 
                                        onClick={() => {
                                            const dialog = getDialog('ShowArbitratorDialog')
                                            dialog.setArbitrator(arbitrator)
                                            dialog.onOpen()
                                        }}
                                        cursor={"pointer"}
                                    >
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
                                    <Td>
                                        <FormattedAddress value={arbitrator.id}/>
                                    </Td>
                                    <Td>
                                        <Wrap justify="left">
                                            { arbitrator.operations?.length > 0 ? 
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
                                    <Td>
                                        <Wrap justify="left">
                                            {arbitrator.contracts?.length > 0 ? 
                                                arbitrator.contracts.map((contract) => {
                                                    return <WrapItem key={contract.contract} width={"auto"}>
                                                        <FormattedAddress value={contract.contract}/>
                                                    </WrapItem>
                                                }) : 
                                                <Text><Trans>Any</Trans></Text>
                                            }
                                        </Wrap>
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