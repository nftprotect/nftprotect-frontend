import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { BigNumber } from '@ethersproject/bignumber';
import { erc721Abi } from 'viem';

const useERC721 = (chainId: number) => {
    const publicClient = usePublicClient({ chainId });
    const {data: walletClient} = useWalletClient({ chainId })

    const getPublicContractInstance = (contractAddress: `0x${string}`) => {
        if (!publicClient) {
            throw new Error('Public client not configured')
        }
        return getContract({
            address: contractAddress as `0x${string}`,
            abi: erc721Abi,
            client: publicClient
        });
    }
    const getWalletContractInstance = (contractAddress: `0x${string}`) => {
        if (!walletClient) {
            throw new Error('Wallet client not configured')
        }
        return getContract({
            address: contractAddress as `0x${string}`,
            abi: erc721Abi,
            client: walletClient
        });
    }

    /**
     * Get the balance of ERC721 tokens for a specific user.
     * @param contractAddress - The address of the ERC721 contract.
     * @param userAddress - The address of the user.
     * @returns The balance of ERC721 tokens.
     */
    const getBalance = async (contractAddress: `0x${string}`, userAddress: `0x${string}`): Promise<BigNumber> => {
        const contract = getPublicContractInstance(contractAddress);
        const balance = await contract.read.balanceOf([userAddress]) as bigint;
        return BigNumber.from(balance.toString());
    };

    /**
     * Set approval for all tokens to be managed by a specific spender.
     * @param contractAddress - The address of the ERC721 contract.
     * @param spender - The address of the spender.
     * @returns The transaction hash.
     */
    const setApprovalForAll = async (contractAddress: `0x${string}`, spender: `0x${string}`): Promise<`0x${string}`> => {
        const contract = getWalletContractInstance(contractAddress);
        const {request} = await contract.simulate.setApprovalForAll([spender, true]);
        return await walletClient!.writeContract(request);
    }

    /**
     * Check if a spender is approved to manage all tokens of an owner.
     * @param contractAddress - The address of the ERC721 contract.
     * @param owner - The address of the owner.
     * @param spender - The address of the spender.
     * @returns True if the spender is approved, false otherwise.
     */
    const isApprovedForAll = async (contractAddress: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`): Promise<boolean> => {
        const contract = getPublicContractInstance(contractAddress);
        const isApproved = await contract.read.isApprovedForAll([owner, spender]) as boolean;
        return isApproved;
    }

    /**
     * Approve a specific address to manage a specific token.
     * @param contractAddress - The address of the ERC721 contract.
     * @param spender - The address of the spender.
     * @param tokenId - The ID of the token.
     * @returns The transaction hash.
     */
    const approve = async (contractAddress: `0x${string}`, spender: `0x${string}`, tokenId: bigint|BigNumber|string): Promise<`0x${string}`> => {
        const contract = getWalletContractInstance(contractAddress);
        const {request} = await contract.simulate.approve([spender, BigInt(tokenId.toString())]);
        return await walletClient!.writeContract(request);
    }

    /**
     * Get the approved address for a specific token.
     * @param contractAddress - The address of the ERC721 contract.
     * @param tokenId - The ID of the token.
     * @returns The address of the approved spender.
     */
    const getApproved = async (contractAddress: `0x${string}`, tokenId: bigint|BigNumber|string): Promise<`0x${string}`> => {
        const contract = getPublicContractInstance(contractAddress);
        const approvedAddress = await contract.read.getApproved([BigInt(tokenId.toString())]) as `0x${string}`;
        return approvedAddress;
    }

    return {
        getBalance,
        setApprovalForAll,
        isApprovedForAll,
        approve,
        getApproved
    };
};

export default useERC721;