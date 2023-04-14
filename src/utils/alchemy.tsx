export const alchemyFetch = async (alchemyChainId: string, method: string, params: any) => {
    const response = await fetch('http://localhost:3000/api/alchemy/alchemy', {
        method: "POST",
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            network: alchemyChainId,
            method: method,
            params: params
        })
    })
    return response.json()
}