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