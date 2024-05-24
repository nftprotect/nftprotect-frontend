import { useClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { BigNumber } from '@ethersproject/bignumber';
import ERC1155ABI from '../abi/ERC1155ABI';

const useERC1155 = (chainId: number) => {
    const client = useClient({ chainId });
    const { data: walletClient } = useWalletClient({ chainId });
    const currentClient = walletClient || client;

    const getBalance = async (contractAddress: `0x${string}`, tokenId: BigNumber|bigint|string, userAddress: `0x${string}`): Promise<BigNumber | null> => {
        if (!currentClient) {
            throw new Error('Client not configured');
        }

        const contract = getContract({
            address: contractAddress as `0x${string}`,
            abi: ERC1155ABI,
            client: currentClient
        });

        try {
            const balance = await contract.read.balanceOf([userAddress, tokenId.toString()]) as bigint;
            return BigNumber.from(balance.toString()); // TODO: use bigint
        } catch (e: any) {
            console.error(`Failed fetching balance for token ${tokenId.toString()} at address ${userAddress}`, e);
            return null;
        }
    };

    return {
        getBalance
    };
};

export default useERC1155;