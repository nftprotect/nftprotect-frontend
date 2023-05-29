import {
    chakra,
    Flex,
    Link,
    Image,
    Text,
} from '@chakra-ui/react'
import { Trans } from '@lingui/macro'

import { HamburgerIcon } from '@chakra-ui/icons'

const Footer = () => {
    return (
        <chakra.footer
            h="100%"
            w="100%"
            px={[3, 6]}
            py="1rem"
            bgColor="#000"
            color="#FFF"
            display="flex"
            flexDirection="row"
            alignItems="center"
            flexWrap='wrap'
            justifyContent="flex-start"
        >
            <Flex justifyContent="space-between">
                <Link href="https://nftprotect.app/" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase" mr={{base: "20px"}}>
                    <Text>
                        <Trans>Website</Trans>
                    </Text>
                </Link>
                <Link href="https://docs.nftprotect.app/" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase" mr={{base: "20px"}}>
                    <Text>
                        <Trans>Whitepaper</Trans>
                    </Text>
                </Link>
                <Link href="https://nftprotect.app/links" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase">
                    <Text>
                        <Trans>Links</Trans>
                    </Text>
                </Link>
            </Flex>
        </chakra.footer>
    )
}

export default Footer