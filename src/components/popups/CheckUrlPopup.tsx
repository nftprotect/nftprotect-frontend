import {
    Box,
    Text,
    Slide,
    useDisclosure,  
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { Trans } from '@lingui/macro'

const CheckUrlPopup = () => {

    const { isOpen, onOpen } = useDisclosure()

    return (
        <Slide
            direction='top'
            in={!isOpen}
            style={ {zIndex: 10 } }
        >
            <Box
                backgroundColor="rgba(0, 0, 0, .8)"
                color="#FFF"
            >
                <Text
                    textAlign="center"
                    fontWeight={["500", "700"]}
                    fontSize={['2xs', 'sm', 'md']}
                    p={2}
                >
                    <Trans>Always make sure the URL is nftprotect.app</Trans>
                </Text>
                <CloseIcon
                    onClick={onOpen}
                    position="absolute"
                    top={["12px", "10px"]}
                    right="10px"
                    cursor="pointer"
                    w={[2, 3]} 
                    h={[2, 3]}
                />
            </Box>
        </Slide>
    )
}

export default CheckUrlPopup
