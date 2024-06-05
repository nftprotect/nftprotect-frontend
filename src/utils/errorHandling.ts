import { BaseError } from "viem";

export const handleTransactionError = (error: any, callback?: Function | { [key: string]: Function, default: Function }) => {
    if (callback) {
        const defaultCallback = (typeof callback === 'function') ? callback : callback.default;
        if (error instanceof BaseError) { // Viem Errors
            const realError = (error.cause instanceof BaseError) ? error.cause : error;
            //debugger;
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
            //debugger;
            defaultCallback(error);
        }
    } else {
        console.error("Unhandled error:", error);
    }
}