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
                errorMapping.default()
            } else {
                console.error(error, error.error)
            }
        } else {
            console.error(error, error.error)
        }
    }
}