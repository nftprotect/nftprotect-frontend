import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { appDescription, appIcon, appName, appUrl, autoConnect, supportedChains } from '../config'
import { ChakraProvider, theme } from '@chakra-ui/react'
import nftProtectTheme from '../theme/index'
import { AppContextProvider } from '../context/AppContextProvider'
import { NotificationContextProvider } from '../context/NotificationContextProvider'
import { IPFSContextProvider } from '../context/IPFSContextProvider'
import { useEffect } from 'react'
import { I18nProvider } from '@lingui/react'
import '@fontsource/lexend/400.css'
import '@fontsource/lexend/600.css'
import '@fontsource/lexend/700.css'
import { CallableDialogContextProvider } from '../context/CallableDialogContextProvider'
import { TheGraphContextProvider } from '../context/TheGraphContextProvider'
//import GoogleAnalytics from '../components/GoogleAnalytics'
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useLinguiInit } from '../utils/lingui';
import { GoogleAnalytics } from '@next/third-parties/google'
import ccTheme from '../theme/ck_theme.json';

const chains = supportedChains.map(it => it.wagmiId)
const connectKitConfig = getDefaultConfig({
    // Required API Keys
    infuraId: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    // Required
    appName,
    // Optional
    autoConnect,
    chains,
    appDescription,
    appUrl, // your app's url
    appIcon, // your app's icon, no bigger than 1024x1024px (max. 1MB)
});
const config = createConfig(connectKitConfig);

function MyApp({ Component, pageProps }: AppProps) {

    const i18n = useLinguiInit(pageProps.translation);
    const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

    useEffect(() => {
        console.log('ENVIRONMENT:', process.env.NODE_ENV)
    }, [])
    
    return (
        <WagmiConfig config={config}>
             <ConnectKitProvider> {/* customTheme={ccTheme}> */}
                <AppContextProvider>
                    <ChakraProvider theme={nftProtectTheme}>
                        <TheGraphContextProvider>
                            <IPFSContextProvider>
                                <NotificationContextProvider>
                                    <CallableDialogContextProvider>
                                        <I18nProvider i18n={i18n}>
                                            <Component {...pageProps} />
                                            { (process.env.NODE_ENV === 'production') && googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId}/> }
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