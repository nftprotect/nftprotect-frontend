import { signingText } from "../config";

/**
 * Returns EIP-712 data for signing
 * 
 * @param chainId The blockchain network ID.
 * @param tokenId The NFT token ID.
 * @param newOwner The new owner's address.
 * @param nonce A unique number for each operation.
 * @param contractAddress The address of the SignatureVerifier contract.
 * @returns An object containing the domain, types, primaryType, and message for signing.
 */
export function getSigningData(chainId: Number, tokenId: string, newOwner: string, nonce: string, contractAddress: string) {
    const domain = {
        name: 'NFTProtect',
        version: '1',
        chainId: chainId,
        verifyingContract: contractAddress as `0x${string}`,
    };

    const types = {
        Message: [
            { name: 'tokenId', type: 'uint256' },
            { name: 'newOwner', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'messageText', type: 'string' },
        ],
    };

    const message = {
        tokenId,
        newOwner: newOwner as `0x${string}`,
        nonce,
        messageText: signingText,
    };

    return {
        domain,
        types,
        primaryType: "Message",
        message,
    };
}