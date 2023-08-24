import { Html, Head, Main, NextScript } from 'next/document'
import GoogleAnalytics from '../components/GoogleAnalytics'

export default function Document() {
    return (
        <Html lang="en">
            <Head></Head>
            <body>
                <Main />
                <NextScript />
                { (process.env.NODE_ENV === 'production') && <GoogleAnalytics/> }
            </body>
        </Html>
    )
}
