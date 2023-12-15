import { ipfsProviderUrl } from '../../../config'
import type { NextApiRequest, NextApiResponse } from 'next'
import httpProxyMiddleware from 'next-http-proxy-middleware'

export const config = {
    api: {
        externalResolver: true,
        bodyParser: false
    },
}

const apiKey = process.env.IPFS_API_KEY
const auth = apiKey ? ('Basic ' + Buffer.from(apiKey).toString('base64')) : undefined   
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('CHECK LOG WORKS')
    const proxyConfig:any = {
        target: ipfsProviderUrl,
        changeOrigin: true,
        pathRewrite: {'^/api/ipfs/ipfs' : ''},
    }
    if (auth) {
        proxyConfig.headers = {
            authorization: auth,
        }    
    }
    console.log('REQUEST:', req.headers, req.body)
    return req.headers//httpProxyMiddleware(req, res, proxyConfig)
};