import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import NFTView from '../components/nftView/NFTView'
import {
    Box,
    Button,
    Card, 
    CardBody,
    Center,
    Container,
    Heading,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Text,
    Flex,
} from '@chakra-ui/react'
import { CloseIcon, ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'

const Home: NextPage = () => {
    const { active } = useWeb3React<Web3Provider>()

    if ( active ) {
        return (
            <div>
                <NavBar />
                <main className={styles.main}>
                    <Container>
                        <NFTView />
                    </Container>
                </main>
            </div>
        )
    } else {
        return (
            <Container maxW="2800px" p={0}>
                <Box
                    bg="rgba(31, 32, 65, 0.25)"
                >
                    <Text 
                        textAlign="center"
                        textTransform="uppercase"
                        fontWeight={["500", "700"]}
                        fontSize={['2xs', 'sm', 'md', 'lg']}
                        p={2}
                    >Always make sure the URL is...
                    </Text>
                    <CloseIcon
                        title="Close"
                        position="absolute"
                        top={["12px", "10px"]}
                        right={["10px"]}
                        cursor="pointer"
                        w={[2, 3]} 
                        h={[2, 3]}
                    />
                </Box>

                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                >  
                    <Flex ml={[2, 4, 6, 10]}>
                        <Image
                            src='/images/logo.svg' 
                            alt='Logo'
                            minW="20px"
                            w={['20px', '35px', '100%']}
                        />
                    </Flex>
                    <Flex mx={[2, 4, 6, 10]}>
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label='Options'
                                icon={<HamburgerIcon />}
                                variant='outline'
                                py={[2, 4]}
                                px={[3, 6]}
                                my={2}
                                mr={2}
                            />
                            <MenuList
                                textTransform="uppercase"
                                fontSize={['xs', 'sm', 'md', 'lg']}
                            >
                                <MenuGroup 
                                    title='Resources'
                                    fontSize={['xs', 'sm', 'md', 'lg']}
                                >
                                    <MenuItem
                                        fontSize={['xs', 'sm', 'md', 'lg']}
                                        textTransform="uppercase"
                                        pl={[8]}
                                    >
                                        Whitepaper
                                    </MenuItem>
                                    <MenuItem
                                        fontSize={['xs', 'sm', 'md', 'lg']}
                                        textTransform="uppercase"
                                        pl={[8]}
                                    >
                                        Security audits
                                    </MenuItem>
                                </MenuGroup>
                                <MenuDivider />
                                <MenuGroup 
                                    title='Legal Documents'
                                    fontSize={['xs', 'sm', 'md', 'lg']}
                                >
                                    <MenuItem
                                        fontSize={['xs', 'sm', 'md', 'lg']}
                                        textTransform="uppercase"
                                        pl={[8]}
                                    >
                                        Terms of service
                                    </MenuItem>
                                    <MenuItem
                                        fontSize={['xs', 'sm', 'md', 'lg']}
                                        textTransform="uppercase"
                                        pl={[8]}
                                    >
                                        Privacy policy
                                    </MenuItem>
                                </MenuGroup>
                            </MenuList>
                        </Menu>

                        <Menu>
                            <MenuButton 
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                                textTransform="uppercase"
                                py={[2, 4]}
                                px={[3, 6]}
                                my={2}
                                mr={2}
                                fontSize={['xs', 'sm', 'md', 'lg']}
                                bg="none"
                                _hover={{
                                    border: "2px",
                                    borderColor: "#BC9CFF",
                                    borderRadius: "22px",
                                }}
                                _active={{
                                    border: "2px",
                                    borderColor: "#BC9CFF",
                                    borderRadius: "22px",
                                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    transition: 'all ease 0.5s'
                                }}
                            >
                                Выбор сети
                            </MenuButton>
                            <MenuList
                                fontSize={['xs', 'sm', 'md', 'lg']}
                            >
                                <MenuItem
                                    borderBottom="2px"
                                    borderColor="#BC9CFF"
                                    borderRadius="0"
                                    transition="all ease 2s"
                                    _hover={{
                                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    }}
                                >Сеть1</MenuItem>
                                <MenuItem
                                    borderBottom="2px"
                                    borderColor="#BC9CFF"
                                    borderRadius="0"
                                    transition="all ease 0.2s"
                                    _hover={{
                                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    }}
                                >Сеть2</MenuItem>
                                <MenuItem
                                    borderBottom="2px"
                                    borderColor="#BC9CFF"
                                    borderRadius="0"
                                    transition="all ease 0.2s"
                                    _hover={{
                                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    }}
                                >Сеть3</MenuItem>
                                <MenuItem
                                    borderBottom="2px"
                                    borderColor="#BC9CFF"
                                    borderRadius="0"
                                    transition="all ease 0.2s"
                                    _hover={{
                                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    }}
                                >Сеть4</MenuItem>
                            </MenuList>
                        </Menu>
                        <LoginForm mt={[8]}/>
                    </Flex>
                </Flex>
                
                <Image 
                    mx={[0, "auto"]}
                    my={[2, 4]}
                    src='/images/banner1.png' alt='Home page banner'
                />

                <Container mt={[6, 20]} centerContent>
                    <Heading
                        as='h3'
                        textAlign="center"
                        fontSize={['lg']}
                        mb={4}
                        color="#1F2041"
                    >Please connect your wallet
                    </Heading>
                    <Text
                        fontSize={['xs', 'sm', 'md', 'lg']}
                        textAlign="center"
                        color="rgba(31, 32, 65, .9)"
                    >Please connect your wallet to see your NFT and wNFT (or ... to protect your NFT)
                    </Text>
                    <Text
                        fontSize={['xs', 'sm', 'md', 'lg']} 
                        textAlign="center"
                        color="rgba(31, 32, 65, .9)"
                    >View only permissions. We will never do anything without your permission</Text>
                    
                    <LoginForm />
                </Container >
                
            </Container>
        )
    }
}

export default Home