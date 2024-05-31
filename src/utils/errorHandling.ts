import { BaseError } from "viem";

export const handleTransactionError = (error: any, callback?: Function | { [key: string]: Function, default: Function }) => {
    if (callback) {
        const defaultCallback = (typeof callback === 'function') ? callback : callback.default;
        if (error instanceof BaseError) { // Viem Errors
            const realError = (error.cause instanceof BaseError) ? error.cause : error;
            debugger;
            if (typeof callback === 'function') {
                callback(realError);
            } else if (callback[realError.name]) {
                callback[realError.name](realError);
            } else if (callback[error.name]) {
                callback[error.name](error);
            } else {
                defaultCallback(realError);
            }
        } else {
            debugger;
            defaultCallback(error);
        }
    } else {
        console.error("Unhandled error:", error);
    }
};

// Function to handle smart contract and provider errors
export const handleContractError = (errorMapping: any = {}) => {
    const codeMapping: any = {
        '-32000': 'ACTION_REJECTED',
        '4001': 'ACTION_REJECTED'
    }

    return (error: any) => {
        let errorMessage: string = error.error?.message || error.code?.toString()
        if (errorMessage) {
            errorMessage = errorMessage.replace('execution reverted: ', '')
            errorMessage = codeMapping[errorMessage] || errorMessage
            if (errorMapping.hasOwnProperty(errorMessage)) {
                const callback = errorMapping[errorMessage]
                callback && callback()
            } else if (errorMapping.default) {
                errorMapping.default(error)
            } else {
                console.error(error, error.error)
            }
        } else {
            console.error(error, error.error)
        }
    }
}