import type { NextApiRequest, NextApiResponse } from 'next'
import { Alchemy } from 'alchemy-sdk'

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = {
    api: {
        externalResolver: true,
        bodyParser: true
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const body = JSON.parse(req.body)
    if (body?.method) {
        const settings = {
            apiKey: apiKey, 
            network: body.network
        };
        // Sanitize input
        const method = body.method.replace(/[^A-Za-z0-9\.]/gi, '');
        const alchemy = new Alchemy(settings);
        const result = await eval(`alchemy.${method}(...body.params)`)
        res.status(200).json(result)
    } else {
        res.status(400).json({error: 'Bad request'})
    }
}