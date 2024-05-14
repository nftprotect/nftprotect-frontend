import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { 
    appDescription, 
    appIcon, 
    appName, 
    appUrl, 
    supportedChains
} from '../config'
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
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useLinguiInit } from '../utils/lingui';
import { GoogleAnalytics } from '@next/third-parties/google'
import ccTheme from '../theme/ck_theme.json';
import { Transport } from 'viem'

const chains = supportedChains.map(it => it.wagmiId)
const transports = supportedChains.reduce((acc, it) => {
    acc[it.id] = it.transport;
    return acc;
  }, {} as Record<number, Transport>);

const connectKitConfig = getDefaultConfig({
    transports,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName,
    // Optional
  //  autoConnect,
    chains: [chains[0], ...chains.slice(1)], // Workaround to make it a tuple
    appDescription,
    appUrl, // your app's url
    appIcon, // your app's icon, no bigger than 1024x1024px (max. 1MB)
});
const config = createConfig(connectKitConfig);
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {

    const i18n = useLinguiInit(pageProps.translation);
    const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

    useEffect(() => {
        console.log('ENVIRONMENT:', process.env.NODE_ENV)
    }, [])
    
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider> {/* customTheme={ccTheme}> */}
                    <AppContextProvider>
                        <ChakraProvider theme={nftProtectTheme}>
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
                        </ChakraProvider>
                    </AppContextProvider>
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default MyApp