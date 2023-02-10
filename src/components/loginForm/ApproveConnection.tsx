import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useWizard } from 'react-use-wizard';

import {
    Box,
    Image,
    Flex,
    Heading,
    Text,
    Icon,
    useDisclosure,
} from '@chakra-ui/react'

import {Metamask} from '@web3uikit/icons'

const ApproveConnection = ({ active }: {active: Boolean}) => {

    const { nextStep } = useWizard()
    // const { onClose } = useDisclosure()
    
    useEffect(() => {
        console.log('Active status', active)
        if (active) {
            nextStep()
        //    onClose()
        }
    }, [])

    return (
        <Flex
            flexWrap={{base: 'wrap', md: 'nowrap'}}
        >
            <Flex
                flexDirection="column"
                w={{base: '100%', md: '50%'}}
                px={[4, 8]}
                py={[4, 8]}
                bgColor="#C3D4FF"
                boxSizing="border-box"
            >
                <Image 
                    src='/images/logo-blue.svg' 
                    alt='Logo' 
                    w={['45px', '45px', '75px']}
                    mb={[2, 4]}
                />
                <Heading
                    fontSize={['lg', 'xl', '2xl']}
                    mb={[4, 8]}
                >Get Started
                </Heading>
                <Heading
                    fontSize={['md', 'lg', 'xl']}
                    mb={2}
                >Approve connection
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                >Please approve the connection in your wallet and authorize access to continue.
                </Text>
            </Flex>
            
            <Flex
                flexDirection="column"
                my={[4, 4, 0] }
            >
                <Box w="100%" textAlign="center">
                    <Heading
                        fontSize={['md', 'lg', 'xl']}
                        mt={["0.5rem"]}
                        mb={[4, 4, 0] }
                        pb={[2]}
                        alignSelf="center"
                        borderBottom="2px dotted #C3D4FF"
                    >
                        Connecting to Metamask
                    </Heading>
                </Box>
                
                <Flex
                    flexWrap="nowrap"
                    borderRadius="1em"
                    border="1px solid #2D7BD6"
                    mx={[4, 8]}
                    my={{sm: '2em', md: 'auto'}}
                    px={[6]}
                    py={[3]}
                >
                    <Flex mr={[3, 6]} alignItems="center">
                        <Metamask
                            fontSize='3em'
                        />
                    </Flex>
                    
                    <Flex 
                        flexDirection="column"
                    >
                        <Heading 
                            fontSize={['md', 'lg', 'xl']}
                            mb={2} 
                        >
                            Connecting...
                        </Heading>
                        <Text 
                            fontSize={['xs', 'sm', 'md']}
                            mb={[2]}
                        >
                            Make sure to select all accounts that you want to grant access to.
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default ApproveConnection