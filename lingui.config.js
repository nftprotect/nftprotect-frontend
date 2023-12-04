const { formatter } = require("@lingui/format-po")

const locales = ["en-us", "ru-ru"]

if (process.env.NODE_ENV !== "production") {
  locales.push("pseudo")
}

/** @type {import('@lingui/conf').LinguiConfig} */
const linguiConfig = {
    locales,
    pseudoLocale: 'pseudo',
    sourceLocale: 'en-us',
    fallbackLocales: {
        default: 'en-us'
    },
    catalogs: [
        {
            path: 'src/locales/{locale}/messages',
            include: [
                'src/pages', 
                'src/components',
                'src/translations/languages.ts'
            ]
        }
    ],
    format: formatter({ origins: false })
}

module.exports = linguiConfig
