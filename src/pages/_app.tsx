import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import { ChakraProvider, theme } from '@chakra-ui/react'
import nftProtectTheme from '../theme/index'
import { libraryPollingInterval } from '../utils/config'
import { AppContextProvider } from '../context/AppContextProvider'
import { NotificationContextProvider } from '../context/NotificationContextProvider'
import { IPFSContextProvider } from '../context/IPFSContextProvider'
import type { I18n } from '@lingui/core'
import { i18n } from '@lingui/core'
import { en, ru } from 'make-plural/plurals'
import { useRouter } from 'next/router'
import { useRef, useEffect } from 'react'
import { I18nProvider } from '@lingui/react'
import '@fontsource/lexend/400.css'
import '@fontsource/lexend/600.css'
import '@fontsource/lexend/700.css'
import { CallableDialogContextProvider } from '../context/CallableDialogContextProvider'
import { TheGraphContextProvider } from '../context/TheGraphContextProvider'

function initTranslation(i18n: I18n): void {
    i18n.loadLocaleData({
        'en-US': { plurals: en },
        'ru-RU': { plurals: ru },
        pseudo: { plurals: en }
    })
}

initTranslation(i18n);

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider, 'any')
    library.pollingInterval = libraryPollingInterval
    return library
}

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const locale = router.locale || router.defaultLocale || ''
    const firstRender = useRef(true)

    if (pageProps.translation && firstRender.current) {
        //load the translations for the locale
        i18n.load(locale, pageProps.translation)
        i18n.activate(locale)
        // render only once
        firstRender.current = false
    }

    // listen for the locale changes
    useEffect(() => {
        if (pageProps.translation) {
            i18n.load(locale, pageProps.translation)
            i18n.activate(locale)
        }
    }, [locale, pageProps.translation])

    useEffect(() => {
        console.log('ENVIRONMENT:', process.env.NODE_ENV)
    }, [])
    
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <AppContextProvider>
                <ChakraProvider theme={nftProtectTheme}>
                    <TheGraphContextProvider>
                        <IPFSContextProvider>
                            <NotificationContextProvider>
                                <CallableDialogContextProvider>
                                    <I18nProvider i18n={i18n}>
                                        <Component {...pageProps} />
                                    </I18nProvider>
                                </CallableDialogContextProvider>
                            </NotificationContextProvider>
                        </IPFSContextProvider>
                    </TheGraphContextProvider>
                </ChakraProvider>
            </AppContextProvider>
        </Web3ReactProvider>
    )
}

export default MyApp