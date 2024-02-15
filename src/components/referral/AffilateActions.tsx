import React, { useState, useEffect } from 'react';
import { AffiliateActionData, AffiliateActionType, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Spinner, TableCaption, Heading } from '@chakra-ui/react';
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
            <Box 
                border="1px solid"
                borderColor="#D9D9D9"
                borderBottom={0}
                borderRadius="5px"
            >
                <Table variant="simple">
                    <TableCaption
                        placement='top'
                        textAlign={'left'}
                        borderBottom={"1px solid"}
                        borderColor="#D9D9D9"
                        py={"1rem"}
                        mt={0}
                    >
                        <Heading
                            as="h2"
                            size="xl"
                            fontWeight="800"
                            color="black"
                        >
                            <Trans>Rewards History</Trans>
                        </Heading>
                    </TableCaption>
                    <Thead >
                        <Tr>
                            <Th borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
                                <Trans>Address</Trans>
                            </Th>
                            <Th borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
                                <Trans>Date</Trans>
                            </Th>
                            <Th borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
                                <Trans>Action</Trans>
                            </Th>
                            <Th borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
                                <Trans>Amount</Trans>
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {actions.map((action) => (
                            <Tr key={action.id.toString()} fontSize={'14px'}>
                                <Td borderColor="#D9D9D9">
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
                                
                                <Td borderColor="#D9D9D9">
                                    {action.date.toLocaleDateString()}
                                </Td>
                                <Td borderColor="#D9D9D9">{
                                    action.type === AffiliateActionType.Register ?
                                    <Text color={'green'}><Trans>Register</Trans></Text> :
                                    <Trans>Protected NFT</Trans>
                                }</Td>
                                <Td borderColor="#D9D9D9">{
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