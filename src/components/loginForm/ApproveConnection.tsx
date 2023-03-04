import { useEffect, useState } from 'react'
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
import { useAppContext } from '../../context/AppContextProvider';
import { Trans } from '@lingui/react'

const ApproveConnection = ({disclosure}: any) => {
    const { active, didRegistered } = useAppContext()
    const { nextStep } = useWizard()
    const { onClose } = disclosure
    
    useEffect(() => {
        if (active) {
            if (didRegistered === true) {
                onClose()
            } else if (didRegistered === false) {
                nextStep()
            }
        }
    }, [active, didRegistered])

    return (
        <Flex
            flexWrap={{base: 'wrap', md: 'nowrap'}}
        >
            <Flex
                flexDirection="column"
                w={{base: '100%', md: '50%'}}
                px={[4, 8]}
                py={[4, 8]}
                bgColor="#5F38C8"
                color="#FFF"
                boxSizing="border-box"
            >
                <Image 
                    src='/images/logomark.svg' 
                    alt='Logo' 
                    w={['45px', '45px', '75px']}
                    mb={[2, 4]}
                />
                <Heading
                    fontSize={['lg', 'xl', '2xl']}
                    mb={[4, 8]}
                >
                    <Trans id='CW-getStarted'>Get Started</Trans>
                </Heading>
                <Heading
                    fontSize={['md', 'lg', 'xl']}
                    mb={2}
                >
                    <Trans id='CW-step2-head'>Approve connection</Trans>
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                >
                    <Trans id='CW-step2-desc'>Please approve the connection in your wallet and authorize access to continue.</Trans>
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
                        <Trans id='CW-step2-subtitle'>Connecting to Metamask</Trans>
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
                            <Trans id='CW-step2-boxhead'>Connecting...</Trans>
                        </Heading>
                        <Text 
                            fontSize={['xs', 'sm', 'md']}
                            mb={[2]}
                        >
                            <Trans id='CW-step2-boxdesc'>Make sure to select all accounts that you want to grant access to.</Trans>
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default ApproveConnection