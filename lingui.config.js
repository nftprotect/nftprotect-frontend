module.exports = {
    locales: ['en-US', 'ru-RU', 'pseudo'],
    pseudoLocale: 'pseudo',
    sourceLocale: 'en-US',
    fallbackLocales: {
        default: 'en-US'
    },
    catalogs: [
        {
            path: 'src/locales/{locale}/messages',
            include: ['src/pages', 'src/components']
        }
    ],
    extractBabelOptions: {
        plugins: ["@lingui/babel-plugin-transform-js", "@lingui/babel-plugin-transform-react"],
    },
    format: 'po'
}