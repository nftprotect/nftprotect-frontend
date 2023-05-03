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
} from "@chakra-ui/react"
import { Trans } from "@lingui/macro"
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
                                return <Tr key={`arb${request.id}`} onClick={() => {
                                    const dialog = getDialog('ShowRequestDialog')
                                    dialog.setRequest(request)
                                    dialog.onOpen()
                                }}>
                                    <Td>{request.name}</Td>
                                    <Td>{request.operation}</Td>
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