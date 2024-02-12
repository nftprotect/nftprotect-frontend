import React, { useState, useEffect } from 'react';
import { AffiliatePaymentData, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text } from '@chakra-ui/react';
import { useAppContext } from '../../context/AppContextProvider';
import AddressDisplay from '../AddressDisplay';
import Davatar from '@davatar/react';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { formatEther } from '@ethersproject/units';
import { Trans } from "@lingui/macro";
import { generateAddressURL } from '../../utils/etherscan';

const AffilatePayments = () => {
        const { account, currentChain } = useAppContext()
        const { listAffiliatePayments } = useNftProtectGraph();
        const [payments, setPayments] = useState<AffiliatePaymentData[]>([]);
        const [loading, setLoading] = useState(true);
    
        useEffect(() => {
            const fetchPayments = async () => {
                if (account) {
                    try {
                        const paymentsData = await listAffiliatePayments(account);
                        setPayments(paymentsData);
                    } catch (error) {
                        console.error('Error fetching affiliate payments:', error);
                    } finally {
                        setLoading(false);
                    }
                }

            };
    
            fetchPayments();
        }, [account]);
    
        if (loading) {
            return <Text>Loading...</Text>;
        }
    
        return (
            <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    <Trans>Rewards History</Trans>
                </Text>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th><Trans>Address</Trans></Th>
                            <Th><Trans>Date</Trans></Th>
                            {/* <Th><Trans>Status</Trans></Th> */}
                            <Th><Trans>Amount</Trans></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {payments.map((payment) => (
                            <Tr key={payment.id.toString()}>
                                <Td>
                                    <Box display="flex" alignItems="center">
                                        <Davatar
                                            size={36}
                                            address={account || ''}
                                            generatedAvatarType='jazzicon'
                                        />
                                        <Link 
                                            href={generateAddressURL(payment.to, currentChain.id)} 
                                            isExternal 
                                            ml={2}
                                        >
                                            <AddressDisplay address={payment.to}/>
                                            <ExternalLinkIcon ml={1}/>
                                        </Link>
                                    </Box>
                                </Td>
                                
                                <Td>{payment.date.toLocaleDateString()}</Td>
                                {/* <Td>Completed</Td> Assuming all payments are completed */}
                                <Td>{`${formatEther(payment.amount)} ETH`}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        );
    };

export default AffilatePayments;