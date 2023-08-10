import Script from 'next/script';

const GoogleTag = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS

    const inlineScriptContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${apiKey}');
    `;

    return (
        <>
        <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${apiKey}`}
            async
        />
        <Script strategy="lazyOnload">
            {inlineScriptContent}
        </Script>
        </>
    );
};

export default GoogleTag
