export function formatAddress(value: string, length: number = 4) {
    return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

export async function copyTextToClipboard(text: string) {
    if ('clipboard' in navigator) {
       return await navigator.clipboard.writeText(text);
    } else {
        return document.execCommand('copy', true, text);
    }
}

export function deIpfsUrl(url: string) {
    if (url.startsWith('ipfs://')) {
        return `https://${url.replace('ipfs://','').replaceAll('/','')}.ipfs.cf-ipfs.com`
    } else {
        return url
    }
}