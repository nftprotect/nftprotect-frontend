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
            position="absolute"
            bottom="0"
            w="100%"
            px={[3, 6]}
            py="1rem"
            bgColor="#000"
            color="#FFF"
        >
            <Flex
                flexDirection="row"
                alignItems="center"
                flexWrap='wrap'
                justifyContent="flex-start"
            >
                <Flex flexDirection="row" flexWrap="nowrap" alignItems="center" mr={{base: "50px"}}>
                    <Image
                        src='/images/logomark.svg'
                        alt='Logo'
                        mr={[2]}
                        h='35px'
                    />
                    <Image
                        src='/images/logotype.svg'
                        alt='Brand'
                        display={{base: 'none', md: 'flex'}}
                        mt={["5px"]}
                        h='20px'
                    />
                </Flex>

                <Flex justifyContent="space-between">
                    <Link href="https://nftprotect.app/" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase" mr={{base: "20px"}}>
                        <Text>
                            <Trans>Website</Trans>
                        </Text>
                    </Link>
                    <Link href="https://docs.nftprotect.app/" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase" mr={{base: "20px"}}>
                        <Text>
                            <Trans>Whitepapers</Trans>
                        </Text>
                    </Link>
                    <Link href="https://nftprotect.app/links" isExternal rel="noreferrer" textStyle="paragraph" textTransform="uppercase">
                        <Text>
                            <Trans>Links</Trans>
                        </Text>
                    </Link>
                </Flex>
            </Flex>
        </chakra.footer>
    )
}

export default Footer