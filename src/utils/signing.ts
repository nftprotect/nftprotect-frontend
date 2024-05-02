import { type UseSignTypedDataParameters } from 'wagmi';

/**
 * Формирует подпись для транзакции NFT Protect.
 * 
 * @param tokenId ID токена NFT.
 * @param newOwner Адрес нового владельца.
 * @param nonce Уникальный номер для каждой транзакции.
 * @param signer Подписывающий объект Wallet из ethers.js.
 * @param contractAddress Адрес контракта SignatureVerifier.
 * @returns Подпись в виде строки.
 */
export function getSigningData(chainId: Number, tokenId: string, newOwner: string, nonce: string, contractAddress: string) {
    // Сообщение, которое будет подписано
    const messageText = `WARNING! READ CAREFULLY!\nBy signing this message, you agree to withdraw your original NFT from the NFT Protect protocol. Access to it will no longer be recoverable through NFT Protect!\n`;

    // Создание хэша сообщения с использованием EIP-712
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
        messageText,
    };

    return {
        domain,
        types,
        primaryType: "Message",
        message,
    };
}