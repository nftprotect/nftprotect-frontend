import React, { useState, useEffect } from 'react';
import { AffiliateActionData, AffiliateActionType, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Spinner } from '@chakra-ui/react';
import { useAppContext } from '../../context/AppContextProvider';
import AddressDisplay from '../AddressDisplay';
import Davatar from '@davatar/react';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { formatEther } from '@ethersproject/units';
import { Trans } from "@lingui/macro";
import { generateAddressURL, generateTxURL } from '../../utils/etherscan';
import { BigNumber } from '@ethersproject/bignumber';

const AffilateActions = () => {
        const { account, currentChain } = useAppContext()
        const { listAffiliateActions } = useNftProtectGraph();
        const [actions, setactions] = useState<AffiliateActionData[]>([]);
        const [loading, setLoading] = useState(true);
    
        useEffect(() => {
            const fetchactions = async () => {
                if (account) {
                    try {
                        const actionsData = await listAffiliateActions(account);
                        setactions(actionsData);
                    } catch (error) {
                        console.error('Error fetching affiliate actions:', error);
                    } finally {
                        setLoading(false);
                    }
                }

            };
    
            fetchactions();
        }, [account]);
    
        if (loading) {
            return <Spinner/>;
        }
    
        return (
            <Box>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th><Trans>Address</Trans></Th>
                            <Th><Trans>Date</Trans></Th>
                            <Th><Trans>Type</Trans></Th>
                            <Th><Trans>Amount</Trans></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {actions.map((action) => (
                            <Tr key={action.id.toString()}>
                                <Td>
                                    <Box display="flex" alignItems="center">
                                        <Davatar
                                            size={ 36 }
                                            address={ action.referral }
                                            generatedAvatarType='jazzicon'
                                        />
                                        <Link 
                                            href={generateTxURL(action.txHash, currentChain.id)} 
                                            isExternal 
                                            ml={2}
                                        >
                                            <AddressDisplay address={action.referral}/>
                                            <ExternalLinkIcon ml={1}/>
                                        </Link>
                                    </Box>
                                </Td>
                                
                                <Td>{action.date.toLocaleDateString()}</Td>
                                <Td>{
                                    action.type === AffiliateActionType.Register ?
                                    <Trans>Register</Trans> :
                                    <Trans>Payment</Trans>
                                }</Td>
                                <Td>{
                                    action.amount.gt(BigNumber.from(0)) ?
                                        `${formatEther(action.amount)} ETH` :
                                        '-'
                                }</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        );
    };

export default AffilateActions;