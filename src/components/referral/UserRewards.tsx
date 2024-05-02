import React, { useState, useEffect } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner, Heading, TableCaption } from '@chakra-ui/react';
import { useAppContext } from '../../context/AppContextProvider';
import { UserData, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Trans } from "@lingui/macro";
import { formatEther } from '@ethersproject/units';

const UserRewards = () => {
    const { account, active, currentChain } = useAppContext();
    const { getUser } = useNftProtectGraph(currentChain.id);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        if (account && active) {
            try {
                const data = await getUser(account);
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [account, active, currentChain]);

    if (loading) {
        return <Spinner/>;
    }

    if (!userData) {
        return <Text><Trans>No data available.</Trans></Text>;
    }

    return (

        <Box 
            border="1px solid"
            borderColor="#D9D9D9"
            borderBottom={0}
            borderRadius="5px"
        >
            <Table 
                variant="simple"                
            >
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
                        <Trans>Your Rewards</Trans>
                    </Heading>
                </TableCaption>
                <Tbody textStyle={'h3'}>
                    <Tr>
                        <Td borderColor="#D9D9D9">
                            <Trans>Total referrals</Trans>
                        </Td>
                        <Td borderColor="#D9D9D9" textAlign={'right'}>
                            {userData.totalReferrals.toString()}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td borderColor="#D9D9D9">
                            <Trans>Total payouts</Trans>
                        </Td>
                        <Td borderColor="#D9D9D9" textAlign={'right'}>
                            {formatEther(userData.totalRewards)} ETH
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    );
};

export default UserRewards;