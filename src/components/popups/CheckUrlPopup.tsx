import {
    Box,
    Text,
    Slide,
    useDisclosure,  
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

const CheckUrlPopup = () => {

    const { isOpen, onOpen } = useDisclosure()

    return (
        <Slide
            direction='top'
            in={!isOpen}
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
                    Always make sure the URL is...
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
