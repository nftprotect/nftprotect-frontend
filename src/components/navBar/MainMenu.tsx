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
                border="1px solid #FFF"
                borderRadius="13px"
                py={[2, 4]}
                px={[3, 6]}
                mr={4}
                _hover={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
                _active={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
            />
            <MenuList
                fontSize={['xs', 'sm', 'md']}
                bgColor="#000"
            >
                <MenuGroup 
                    title='Resources'
                    fontSize={['xs', 'sm', 'md']}
                >
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        bg="none"
                        _hover={{
                            bgColor: "rgba(255, 255, 255, 0.15)"
                        }}
                    >
                        Whitepaper
                    </MenuItem>
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        bg="none"
                        _hover={{
                            bgColor: "rgba(255, 255, 255, 0.15)"
                        }}
                    >
                        Security audits
                    </MenuItem>
                </MenuGroup>
                <MenuDivider color="#FFF" />
                <MenuGroup 
                    title='Legal Documents'
                    fontSize={['xs', 'sm', 'md']}
                >
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        bg="none"
                        _hover={{
                            bgColor: "rgba(255, 255, 255, 0.15)"
                        }}
                    >
                        Terms of service
                    </MenuItem>
                    <MenuItem
                        fontSize={['xs', 'sm', 'md']}
                        pl={[8]}
                        bg="none"
                        _hover={{
                            bgColor: "rgba(255, 255, 255, 0.15)"
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