import React from "react"
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
    Badge
} from "@chakra-ui/react"
import { Trans, t } from "@lingui/macro"
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"

export enum ArbitratorRequestStatus {
    InDispute,
    Accepted,
    Rejected
}

export enum MasterOperation {
    AddArbitrator = 'AddArbitrator',
    AddOperation = 'AddOperation',
    AddContract = 'AddContract'
}

export interface ArbitratorRequest {
    id: string,
    disputeID: string,
    status: ArbitratorRequestStatus,
    operation: MasterOperation,
    name: string,
}

const masterOperationsMap: any = {
    AddArbitrator: t`Add new arbitrator`,
    AddOperations: t`Add operations`,
    AddContract: t`Add collections`,
}

export const MasterOperationBadge = ({value} : {value: string}) => {
    return <Badge variant='solid' colorScheme='blue' px={'0.5em'} mr={'0.5em'}>
        { masterOperationsMap[value] || t`unknown` }
    </Badge>
}

const ArbitratorRequestList = ({requests}: {
    requests: ArbitratorRequest[]
}) => {

    const { getDialog } = useCallableDialogContext()

    return (
        <>        
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th><Trans>Name</Trans></Th>
                            <Th><Trans>Pending Action</Trans></Th>
                            <Th><Trans>Dispute</Trans></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            requests.map((request) => {
                                return <Tr key={`arb${request.id}`}>
                                    <Td
                                        onClick={() => {
                                            const dialog = getDialog('ShowRequestDialog')
                                            dialog.setRequest(request)
                                            dialog.onOpen()
                                        }}
                                        cursor={"pointer"}
                                    >
                                        {request.name}
                                    </Td>
                                    <Td>
                                        <MasterOperationBadge value={request.operation}/>
                                    </Td>
                                    <Td># {request.disputeID}</Td>
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

export default ArbitratorRequestList