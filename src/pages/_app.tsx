import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import { ChakraProvider, theme } from '@chakra-ui/react'
import { libraryPollingInterval } from '../utils/config'
import { AppContextProvider } from '../context/AppContextProvider'
import { NotificationContextProvider } from '../context/NotificationContextProvider'

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider)
    library.pollingInterval = libraryPollingInterval
    return library
}

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <AppContextProvider>
                <ChakraProvider theme={theme}>
                    <NotificationContextProvider>
                        <Component {...pageProps} />
                    </NotificationContextProvider>
                </ChakraProvider>
            </AppContextProvider>
        </Web3ReactProvider>
    )
}

export default MyApp