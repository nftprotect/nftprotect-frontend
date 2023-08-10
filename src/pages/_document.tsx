import { Html, Head, Main, NextScript } from 'next/document'
import GoogleAnalytics from '../components/GoogleAnalytics'
import GoogleTag from '../components/GoogleTag'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                { (process.env.NODE_ENV === 'production') && <>
                    <GoogleAnalytics/>
                    <GoogleTag/>
                </> }
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
