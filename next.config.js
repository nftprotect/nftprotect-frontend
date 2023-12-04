const linguiConfig = require("./lingui.config")

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        swcPlugins: [
            [
            "@lingui/swc-plugin", {}
            ],
        ],
    },
    i18n: {
        localeDetection: false, // temporarily disable locale autodetection
        locales: linguiConfig.locales,
        defaultLocale: linguiConfig.sourceLocale || 'en-us',
    }
}

module.exports = nextConfig