module.exports = {
    locales: ['en', 'ru', 'pseudo'],
    pseudoLocale: 'pseudo',
    sourceLocale: 'en',
    fallbackLocales: {
        default: 'en'
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
    compilerBabelOptions: {
        plugins: ["@lingui/babel-plugin-transform-react"],
    },
    format: 'po'
}