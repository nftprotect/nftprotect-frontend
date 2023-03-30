import Script from 'next/script';

const GoogleAnalytics = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS
    return apiKey ? (<>
        <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${apiKey}`} />

        <Script strategy="lazyOnload" id="googleAnalyticsScript">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${apiKey}', {
                page_path: window.location.pathname,
                });
            `}
        </Script>
    </>) : (<></>)
}

export default GoogleAnalytics