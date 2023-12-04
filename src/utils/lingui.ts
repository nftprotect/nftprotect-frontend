import { i18n, Messages } from '@lingui/core';
import { useRouter } from 'next/router';

export const loadTranslation = async (locale: string, isProduction = true) => {
    let data
    if (isProduction) {
        data = await import(`../locales/${locale}/messages`)
    } else {
        data = await import(
            `@lingui/loader!../locales/${locale}/messages.po`
        )
    }
    return data.messages
}

export function useLinguiInit(messages: Messages|undefined) {
    const router = useRouter()
    const locale = router.locale || router.defaultLocale!
    if (messages) {
        i18n.load(locale, messages)
        i18n.activate(locale)
    }
    return i18n;
}