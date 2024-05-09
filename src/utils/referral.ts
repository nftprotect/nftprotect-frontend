import { isAddress } from 'viem';
import baseX from 'base-x';

// Base58 alphabet
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = baseX(BASE58);

export const handleReferralLink = (refParam: string) => {
    const addr = decodeAddress(refParam);
    if (isAddress(addr)) {
        console.log('Correct referral link detected. Address:', addr);
        saveInvite(addr);
        return addr;
    } else  {
        console.error('Incorrect referral link provided:', refParam);
        return null;
    }
}

export const saveInvite = (addr: `0x${string}`) => {
    localStorage.setItem('followedInvitation', addr);
}

export const loadInvite = () => {
    const invite = localStorage.getItem('followedInvitation');
    if (invite && isAddress(invite)) {
        return invite as `0x${string}`;
    }
    return null;
}

export const clearInvite = () => {
    localStorage.removeItem('followedInvitation');
}

export function encodeAddress(address: `0x${string}`): string {
    const buffer = Buffer.from(address.slice(2).toLowerCase(), 'hex');
    return bs58.encode(buffer);
}

export function decodeAddress(encoded: string): string {
    const decodedBuffer = bs58.decode(encoded);
    return '0x' + decodedBuffer.toString();
}
