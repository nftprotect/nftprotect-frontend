import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useWizard } from 'react-use-wizard';

import {
    Card, 
    CardBody,
    Flex,
    Heading,
    Text,
    Spinner,
    useDisclosure,
} from '@chakra-ui/react'

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
            flexDirection="column"
            flexWrap={{base: 'wrap', md: 'nowrap'}}
        >
            <Card>
                <CardBody>
                    <Heading
                        as='h4'
                        fontSize={['md', 'xl', '2xl']}
                        mb={2}
                        color="#1F2041"
                    >Approve connection
                    </Heading>
                    <Text
                        fontSize={['xs', 'sm', 'md']}
                    >Please approve the connection in your wallet and authorize access to continue.
                    </Text>
                    <Spinner
                        mt={[4]}
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color="#8BA4F9"
                        size={['lg', 'xl']}
                    />
                </CardBody>
            </Card>
        </Flex>
)}

export default ApproveConnection