import { i18n, Messages } from '@lingui/core';
import { useRouter } from 'next/router';

const useLinguiInit = (messages: Messages|undefined) => {
    const router = useRouter()
    const locale = router.locale || router.defaultLocale!
    if (messages) {
        i18n.load(locale, messages)
        i18n.activate(locale)
    }
    return i18n;
}

export default useLinguiInit;