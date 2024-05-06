import React, { useState, useEffect } from 'react';
import { AffiliateActionData, AffiliateActionType, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Spinner, TableCaption, Heading } from '@chakra-ui/react';
import { useAppContext } from '../../context/AppContextProvider';
import AddressDisplay from '../AddressDisplay';
import { Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { formatEther } from '@ethersproject/units';
import { Trans } from "@lingui/macro";
import { generateAddressURL, generateTxURL } from '../../utils/etherscan';
import { BigNumber } from '@ethersproject/bignumber';
import Avatar from '../navBar/Avatar';
import useEnsName from '../../hooks/useEnsName';
import { formatAddress } from '../../utils/helpers';

interface PersonInterface {
    address: `0x${string}`,
    link: string,
    text: string
}

const Person = ({address, link, text}: PersonInterface) => {

    const name = useEnsName(address);

    return <Box display="flex" alignItems="center">
        <Avatar
            size={ 36 }
            address={ address }
            name={ name }
        />
        <Box as="span" whiteSpace="nowrap">
            <Link 
                href={link} 
                isExternal 
                ml={2}
            >
                <AddressDisplay address={ name || formatAddress(address, 4) }/>
                <ExternalLinkIcon ml={1}/>
            </Link>
            <Text display={{ base: 'block', md: 'none' }} fontSize="xs" color="gray.500" ml={2}>
                { text }
            </Text>
        </Box>
    </Box>
}

const AffilateActions = () => {
        const { account, currentChain } = useAppContext()
        const { listAffiliateActions } = useNftProtectGraph(currentChain.id);
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
                            <Th display={{ base: 'none', md: 'table-cell' }} borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
                                <Trans>Date</Trans>
                            </Th>
                            <Th display={{ base: 'none', md: 'table-cell' }} borderColor="#D9D9D9" fontSize={'16px'} textTransform={'none'}>
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
                                    <Person 
                                        address={account!} 
                                        link={generateTxURL(action.txHash, currentChain.id)}
                                        text={action.date.toLocaleDateString()}
                                    />
                                </Td>
                                
                                <Td display={{ base: 'none', md: 'table-cell' }} borderColor="#D9D9D9">
                                    {action.date.toLocaleDateString()}
                                </Td>
                                <Td display={{ base: 'none', md: 'table-cell' }} borderColor="#D9D9D9">{
                                    action.type === AffiliateActionType.Register ?
                                    <Text color={'green'}><Trans>Register</Trans></Text> :
                                    <Trans>Protected NFT</Trans>
                                }</Td>
                                <Td borderColor="#D9D9D9">{
                                    action.amount.gt(BigNumber.from(0)) ?
                                        `${formatEther(action.amount)} ETH` :
                                        <Box>
                                            {/* Small screen */}
                                            <Text display={{ base: 'table-cell', md: 'none' }} color={'green'}><Trans>Register</Trans></Text>
                                            {/* Big screen */}
                                            <Text display={{ base: 'none', md: 'table-cell' }}>-</Text>
                                        </Box>
                                }</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        );
    };

export default AffilateActions;