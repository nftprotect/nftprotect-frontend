import { Contract } from '@ethersproject/contracts';
import { isAddress } from 'viem';

export const handleReferralLink = (refParam: string) => {
    const addr = Buffer.from(refParam, 'base64').toString('utf-8');
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

export const loadReferrer = async (userRegistry: Contract, account: `0x${string}`) => {
    const referrerAddress = await userRegistry.referrers(account)
    return referrerAddress;
}