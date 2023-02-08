import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import { ChakraProvider, theme } from '@chakra-ui/react'
import { libraryPollingInterval } from '../utils/config'

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider)
    library.pollingInterval = libraryPollingInterval
    return library
}

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
                <ChakraProvider theme={theme}>
                    <Component {...pageProps} />
                </ChakraProvider>
        </Web3ReactProvider>
    )
}

export default MyApp