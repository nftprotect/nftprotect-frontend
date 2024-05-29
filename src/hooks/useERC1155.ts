import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { BigNumber } from '@ethersproject/bignumber';
import ERC1155ABI from '../abi/ERC1155ABI';

const useERC1155 = (chainId: number) => {
    const publicClient = usePublicClient({ chainId });
    const {data: walletClient} = useWalletClient({ chainId })

    const getPublicContractInstance = (contractAddress: `0x${string}`) => {
        if (!publicClient) {
            throw new Error('Public client not configured')
        }
        return getContract({
            address: contractAddress as `0x${string}`,
            abi: ERC1155ABI,
            client: publicClient
        });
    }

    const getWalletContractInstance = (contractAddress: `0x${string}`) => {
        if (!walletClient) {
            throw new Error('Wallet client not configured')
        }
        return getContract({
            address: contractAddress as `0x${string}`,
            abi: ERC1155ABI,
            client: walletClient
        });
    }

    /**
     * Return token balance of the specified address.
     * @param contractAddress The address of the token contract.
     * @param tokenId The id of the token.
     * @param userAddress The address of the account to check balance.
     * @returns True if the spender is approved, false otherwise.
     */
    const getBalance = async (contractAddress: `0x${string}`, tokenId: BigNumber|bigint|string, userAddress: `0x${string}`): Promise<BigNumber> => {
        const contract = getPublicContractInstance(contractAddress);
        const balance = await contract.read.balanceOf([userAddress, tokenId.toString()]) as bigint;
        return BigNumber.from(balance.toString()); // TODO: use bigint
    };

    /**
     * Approves a spender to manage the tokens of the caller.
     * @param contractAddress The address of the token contract.
     * @param spender The address of the account to be approved.
     * @param tokenId The ID of the token to be approved.
     * @returns Transaction receipt.
     */
    const setApprovalForAll = async (contractAddress: `0x${string}`, spender: `0x${string}`): Promise<`0x${string}`> => {
        const contract = getWalletContractInstance(contractAddress);
        return await contract.write.setApprovalForAll([spender, true]);
    }

    /**
     * Checks if an address is approved for managing the tokens of another address.
     * @param contractAddress The address of the token contract.
     * @param owner The address of the owner of the tokens.
     * @param spender The address of the account to check for approval.
     * @returns True if the spender is approved, false otherwise.
     */
    const isApprovedForAll = async (contractAddress: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`): Promise<boolean> => {
        const contract = getPublicContractInstance(contractAddress);
        const isApproved = await contract.read.isApprovedForAll([owner, spender]) as boolean;
        return isApproved;
    }

    return {
        getBalance,
        setApprovalForAll,
        isApprovedForAll
    };
};

export default useERC1155;