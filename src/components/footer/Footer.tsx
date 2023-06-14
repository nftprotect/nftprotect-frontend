import {
    chakra,
    Flex,
    Link,
    Text,
    Image,
    Icon,
} from '@chakra-ui/react'
import { Trans } from '@lingui/macro'
import { Twitter, Discord, TelegramFill, Github } from '@web3uikit/icons'

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

            {/* <Flex alignItems="center">
                <Link href="https://go.nftprotect.app/twitter" isExternal rel="noreferrer" mr={{base: "20px"}}>
                    <Image src="./images/socialIcons/Twitter.svg" alt="Twitter Icon"></Image>
                </Link>

                <Link href="https://go.nftprotect.app/telegram?_gl=1*1k4nolr*_ga*NzU4OTEwMzk1LjE2NzkwNzQ3OTA.*_ga_0WT85RBVE8*MTY4NjUwNjIyNi4xLjEuMTY4NjUwNjI2MC4yNi4wLjA." isExternal rel="noreferrer" mr={{base: "20px"}}>
                    <Image src="./images/socialIcons/Telegram.svg" alt="Telegram Icon"></Image>
                </Link>

                <Link href="https://go.nftprotect.app/discord?_gl=1*10vv0fo*_ga*NzU4OTEwMzk1LjE2NzkwNzQ3OTA.*_ga_0WT85RBVE8*MTY4NjUwNjIyNi4xLjAuMTY4NjUwNjIzMS41NS4wLjA." isExternal rel="noreferrer" mr={{base: "20px"}}>
                    <Image src="./images/socialIcons/Discord.svg" alt="Discord Icon"></Image>
                </Link>

                <Flex alignItems="center">
                    <Link href="https://go.nftprotect.app/github" isExternal rel="noreferrer" >
                        <Image src="./images/socialIcons/Github.svg" alt="Github Icon"></Image>
                    </Link>
                </Flex>
            </Flex> */}
        </chakra.footer>
    )
}

export default Footer