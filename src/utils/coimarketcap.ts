import axios from 'axios';

export const getTokenPrice = async (symbol: string): Promise<number> => {
    try {
        const {data} = await axios.get(
            `/api/tokenprice/tokenprice?symbol=${symbol}`,
        );
        return data;
    } catch (error) {
        console.error('Error fetching token price:', error);
        throw error;
    }
}