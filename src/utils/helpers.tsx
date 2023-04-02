import { hexValue } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';

export function formatAddress(value: string, length: number = 4) {
    return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

export async function copyTextToClipboard(text: string, selector: string|null = null) {
   if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
   } else if (selector) {
        let copyText:any = document.querySelector(selector || '');
        copyText.select();
        return document.execCommand('copy', true);
   }
}

interface ProviderError {
   code: number,
   message: string
}

export const switchNetwork = async (networkId: any) => {
   // check if the user is connected through MetaMask
   if (window.ethereum?.request !== undefined) {
       try {
           const accounts = await window.ethereum.request({
               method: 'wallet_switchEthereumChain',
               params: [{ chainId: hexValue(BigNumber.from(networkId).toHexString()) }],
           });
       } catch (error) {
           const e = error as ProviderError
           if (e?.code === 4902) {
               console.log(error)
               alert('Add network first!')
           } else {
               console.error(error)
           }
       }
   }
}