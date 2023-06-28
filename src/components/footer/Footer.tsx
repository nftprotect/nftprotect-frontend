import {
    chakra,
    Flex,
    Link,
    Text,
    Image,
    Icon,
} from '@chakra-ui/react'
import { Trans } from '@lingui/macro'
import { Twitter, Discord2, TelegramFill, Github } from '@web3uikit/icons'

const Footer = () => {
    return (
        <chakra.footer
            h="100%"
            w="100%"
            px={[3, 6]}
            py="1rem"
            bgColor="brand.light"
            color="#FFF"
            display="flex"
            flexDirection="row"
            alignItems="center"
            flexWrap='wrap'
            justifyContent="space-between"
        >
            <Flex alignItems="center">
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

            <Flex alignItems="center" h={{base: "30px"}}>

                <Flex h="100%" mr={{base: "20px"}}>
                    <Link href="https://go.nftprotect.app/twitter" isExternal rel="noreferrer">
                        <Twitter fontSize='32px'/>
                    </Link>
                </Flex>

                <Flex h="100%" mr={{base: "20px"}}>
                    <Link href="https://go.nftprotect.app/telegram?_gl=1*1k4nolr*_ga*NzU4OTEwMzk1LjE2NzkwNzQ3OTA.*_ga_0WT85RBVE8*MTY4NjUwNjIyNi4xLjEuMTY4NjUwNjI2MC4yNi4wLjA." isExternal rel="noreferrer">
                        <TelegramFill fontSize='32px'/>
                    </Link>
                </Flex>

                <Flex h="100%" mr={{base: "20px"}}>
                    <Link href="https://go.nftprotect.app/discord?_gl=1*10vv0fo*_ga*NzU4OTEwMzk1LjE2NzkwNzQ3OTA.*_ga_0WT85RBVE8*MTY4NjUwNjIyNi4xLjAuMTY4NjUwNjIzMS41NS4wLjA." isExternal rel="noreferrer">
                        <Image src="./images/socialMediaIcons/discord.svg" alt="Discord icon" h="100%" />
                    </Link>
                </Flex>

                <Flex h="100%">
                    <Link href="https://go.nftprotect.app/github" isExternal rel="noreferrer">
                        <Github fontSize='42px'/>
                    </Link>
                </Flex>
                
            </Flex>
        </chakra.footer>
    )
}

export default Footer