/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n: {
        localeDetection: false, // temporarily disable locale autodetection
        locales: ["en-US", "ru-RU", "pseudo"],
        defaultLocale: "en-US",
    },
}

module.exports = nextConfig
