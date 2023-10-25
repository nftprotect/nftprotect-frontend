import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { supportedChains } from '../utils/config'
import { ChakraProvider, theme } from '@chakra-ui/react'
import nftProtectTheme from '../theme/index'
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
import GoogleAnalytics from '../components/GoogleAnalytics'
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

function initTranslation(i18n: I18n): void {
    i18n.loadLocaleData({
        'en-US': { plurals: en },
        'ru-RU': { plurals: ru },
        pseudo: { plurals: en }
    })
}

initTranslation(i18n);

const chains = supportedChains.map(it => it.wagmiId)

const config = createConfig(
    getDefaultConfig({
        // Required API Keys
        infuraId: process.env.INFURA_ID,
        walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || '',
        // Required
        appName: "NFT Protect",
        // Optional
        autoConnect: true,
        chains,
        appDescription: "NFT Protect is an application that allows you to protect your NFTs and be sure of their safety without fear of theft.",
        appUrl: "https://dev.nftprotect.app", // your app's url
        appIcon: "https://dev.nftprotect.app/images/logoBlue.svg", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);

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
        <WagmiConfig config={config}>
            <ConnectKitProvider>
                <AppContextProvider>
                    <ChakraProvider theme={nftProtectTheme}>
                        <TheGraphContextProvider>
                            <IPFSContextProvider>
                                <NotificationContextProvider>
                                    <CallableDialogContextProvider>
                                        <I18nProvider i18n={i18n}>
                                            <Component {...pageProps} />
                                            { (process.env.NODE_ENV === 'production') && <GoogleAnalytics/> }
                                        </I18nProvider>
                                    </CallableDialogContextProvider>
                                </NotificationContextProvider>
                            </IPFSContextProvider>
                        </TheGraphContextProvider>
                    </ChakraProvider>
                </AppContextProvider>
            </ConnectKitProvider>
        </WagmiConfig>
    )
}

export default MyApp