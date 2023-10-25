import { hexValue } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { defaultChain } from './config';

export function formatAddress(value: string, length: number = 4) {
    if (value.length <= length*2+2) return value
    return `${value.substring(0, length + 2)}…${value.substring(value.length - length)}`
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

export const generateUUID = () => { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export const timestampToDate = (timestamp: number) => new Date(timestamp * 1000 )
export const addTimestampToDate = (date: Date, timestamp: number) => {
    const currentTimestamp = date.getTime()
    const newTimestamp = currentTimestamp + timestamp
    return new Date(newTimestamp)
}

export const generateRequestLink = (requestId: any, chainId: number = defaultChain) => {
    return `/request/${chainId}/${requestId.toString()}`
}

export const capitalize = (s: string) => s.length > 0 ? `${s[0].toUpperCase()}${s.slice(1,s.length)}` : ''
