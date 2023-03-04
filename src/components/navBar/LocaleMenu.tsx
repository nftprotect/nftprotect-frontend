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
        'en-US': t`English`,
        'ru-RU': t`Russian`,
    }

    // enable 'pseudo' locale only for development environment
    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        languages['pseudo'] = t`Pseudo`
    }

    useEffect(() => {
        router.push(router.pathname, router.pathname, { locale })
    }, [locale])

    return (
        <Menu>
            <MenuButton 
                as={Button}
                rightIcon={<ChevronDownIcon />}
                py={[2, 4]}
                px={[3, 6]}
                mr={4}
                fontSize={['xs', 'sm', 'md']}
                bg="none"
                border="1px solid #FFF"
                borderRadius="13px"
                _hover={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
                _active={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
            >
                { languages[locale] }
            </MenuButton>
                <MenuList bgColor="#000">
                    { Object.keys(languages).map((locale) => {
                        return (
                            <MenuItem
                                key={locale}
                                value={locale} 
                                onClick={(e: any) => setLocale(e.target.value)}
                                fontSize={['xs', 'sm', 'md']}
                                bg="none"
                                _hover={{
                                    bgColor: "rgba(255, 255, 255, 0.15)"
                                }}
                                _active={{
                                    bgColor: "rgba(255, 255, 255, 0.15)"
                                }}
                            >
                                { languages[locale] }
                            </MenuItem>
                    )}) }
                </MenuList>
        </Menu>
    )
}