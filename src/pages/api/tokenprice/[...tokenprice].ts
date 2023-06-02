import type { NextApiRequest, NextApiResponse } from 'next'
import { coinmarketcapUrl } from '../../../utils/config'
import axios from 'axios';

const apiKey = process.env.COINMARKETCAP_API_KEY

export const config = {
    api: {
        externalResolver: true,
        bodyParser: false
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const symbol = req.query?.symbol
    if (symbol) {
        try {
            const response = await axios.get(
                `${coinmarketcapUrl}/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`,
                {
                    headers: {
                        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
                    },
                }
            );          
            const tokenPriceInUsd = response.data.data[symbol].quote.USD.price;
            res.status(200).json(tokenPriceInUsd)
        } catch (error) {
            // console.error('Error fetching ticker:', error);
            res.status(500).json({error: 'Error fetching token price'})
        }
    } else {
        res.status(400).json({error: 'Bad request'})
    }
}