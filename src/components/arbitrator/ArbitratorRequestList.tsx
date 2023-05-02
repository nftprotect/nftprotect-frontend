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

export interface Operation {
    id: string,
    operation: string,
    extraData: string
}

export interface ArbitratorData {
    id: string,
    name: string,
    manager: string,
    operations: Operation[],
    contracts: string[],
    requests: ArbitratorRequest[]
}

export interface ArbitratorRequest {
    id: string,
    disputeID: string,
    status: ArbitratorRequestStatus,
    operation: MasterOperation,
    arbitrator: ArbitratorData,
    candidate: string,
}

const ArbitratorRequestList = ({requests}: {
    requests: ArbitratorRequest[]
}) => {

    return (
        <>        
            <TableContainer>
                <Table variant='simple'>
                    <TableCaption placement="top">
                        <Trans>Existing requests:</Trans>
                    </TableCaption>
                    <Thead>
                        <Tr>
                            <Th><Trans>Arbitrator</Trans></Th>
                            <Th><Trans>Operation</Trans></Th>
                            <Th><Trans>Dispute</Trans></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            requests.map(({candidate, operation, disputeID}) => {
                                return  <Tr>
                                    <Td>{candidate}</Td>
                                    <Td>{operation}</Td>
                                    <Td>{disputeID}</Td>
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