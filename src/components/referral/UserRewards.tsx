import React, { useState, useEffect } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner } from '@chakra-ui/react';
import { useAppContext } from '../../context/AppContextProvider';
import { UserData, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import { Trans } from "@lingui/macro";
import { formatEther } from '@ethersproject/units';

const UserRewards = () => {
    const { account } = useAppContext();
    const { getUser } = useNftProtectGraph();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (account) {
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

        fetchUserData();
    }, [account, getUser]);

    if (loading) {
        return <Spinner/>;
    }

    if (!userData) {
        return <Text><Trans>No data available.</Trans></Text>;
    }

    return (
        <Box>
            <Table variant="simple">
                <Tbody>
                    <Tr>
                        <Td><Trans>Total referrals</Trans></Td>
                        <Td>{userData.totalReferrals.toString()}</Td>
                    </Tr>
                    <Tr>
                        <Td><Trans>Total payouts</Trans></Td>
                        <Td>{formatEther(userData.totalRewards)} ETH</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    );
};

export default UserRewards;