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
                        <Icon fontSize='32px' viewBox="0 0 19 15">
                            <path fill="#FFF" d="M10.84.985H7.731A.69.69 0 0 1 7.07.492.69.69 0 0 0 6.408 0h-.324a1 1 0 0 0-.371.072L4.566.53l-1.43.576a1 1 0 0 0-.432.335L1.91 2.518a1 1 0 0 0-.116.205l-.543 1.292L.47 6.101a1 1 0 0 0-.044.15L.02 8.234a1 1 0 0 0-.02.2v3.6a1 1 0 0 0 .454.838l1.651 1.075c.07.045.144.082.222.108l1.208.415.515.206a1 1 0 0 0 1.241-.435l.115-.203a1 1 0 0 0-.363-1.355l-.625-.367a.148.148 0 0 1 .13-.264l1.752.708c.071.029.145.049.22.06l2.24.35c.052.008.103.012.155.012h1.675c.059 0 .117-.005.176-.016l1.474-.264c.088-.015.173-.042.253-.08l1.658-.788a.21.21 0 0 1 .193.372l-.665.373a.795.795 0 0 0-.29 1.107l.235.387a1 1 0 0 0 1.23.408l1.56-.632c.054-.023.107-.05.157-.081l1.797-1.133a1 1 0 0 0 .461-.742l.16-1.535a.996.996 0 0 0 0-.207l-.21-2.018-.355-2.08a.994.994 0 0 0-.039-.155l-.71-2.083-.622-1.314a.993.993 0 0 0-.099-.165l-.823-1.12a1 1 0 0 0-.38-.312L14.335.436a1.002 1.002 0 0 0-.252-.08L12.684.108a1 1 0 0 0-.975.385l-.068.09a1 1 0 0 1-.8.402Z"></path>
                            <ellipse cx="6.333" cy="8.182" rx="1.915" ry="1.97" fill="#1316DD"></ellipse>
                            <ellipse cx="12.667" cy="8.182" rx="1.915" ry="1.97" fill="#1316DD"></ellipse>
                        </Icon>
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