import { 
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuList,
    MenuItem,
    IconButton,
} from '@chakra-ui/react'

import { HamburgerIcon } from '@chakra-ui/icons'

const MainMenu = () => {
    return (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<HamburgerIcon />}
                variant='outline'
                bg="none"
                borderRadius="13px"
                py={[2, 4]}
                px={[3, 6]}
                my={2}
                mr={2}
                _hover={{
                    border: "2px",
                    borderColor: "#BC9CFF",
                    borderRadius: "13px",
                }}
                _active={{
                    borderRadius: "13px",
                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                }}
            />
            <MenuList
                fontSize={['xs', 'sm', 'md']}
            >
                <MenuGroup 
                    title='Resources'
                    fontSize={['xs', 'sm', 'md']}
                >
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        _hover={{
                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                        }}
                    >
                        Whitepaper
                    </MenuItem>
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        _hover={{
                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                        }}
                    >
                        Security audits
                    </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup 
                    title='Legal Documents'
                    fontSize={['xs', 'sm', 'md']}
                >
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        _hover={{
                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                        }}
                    >
                        Terms of service
                    </MenuItem>
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        _hover={{
                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                        }}
                    >
                        Privacy policy
                    </MenuItem>
                </MenuGroup>
            </MenuList>
        </Menu>
    )
}

export default MainMenu