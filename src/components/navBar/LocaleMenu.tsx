import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'
import { 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'

export const LocaleMenu = () => {
    const router = useRouter()
    const [locale, setLocale] = useState<string>(
        router.locale || router.defaultLocale || ''
    )

    const languages: { [key: string]: string } = {
        'en-us': t`English`,
        'ru-ru': t`Russian`,
    }

    // enable 'pseudo' locale only for development environment
    if (process.env.NODE_ENV !== 'production') {
        languages['pseudo'] = t`Pseudo`
    }

    useEffect(() => {
        router.push(router.pathname, router.pathname, { locale })
    }, [locale])

    return (
        <Menu>
            <MenuButton 
                as={Button}
                variant="primaryDark"
                fontWeight="400"
                rightIcon={<ChevronDownIcon />}
            >
                { languages[locale] }
            </MenuButton>
            <MenuList>
                { Object.keys(languages).map((locale) => {
                    return (
                        <MenuItem
                            key={locale}
                            value={locale} 
                            onClick={(e: any) => setLocale(e.target.value)}
                        >
                            { languages[locale] }
                        </MenuItem>
                )}) }
            </MenuList>
        </Menu>
    )
}