import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = definePartsStyle({
    // define the part you're going to style
    dialog: {
        borderRadius: "8px",
    }
})

const stepModal = definePartsStyle({
    overlay: {
        bg: 'blackAlpha.700'
    },
    dialogContainer: {
        scrollBehavior: "inside",
        alignItems: "center",
        closeOnOverlayClick: false
    },
    dialog: {
        my: "0",
        bg: "#FFF",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backdropFilter: "blur(7.5px)",
        overflowY: 'auto',
        maxH: "90%"
    },
    closeButton: {
        zIndex: "2"
    },
    body:{
        p: "0"
    },
    footer:{}
})

export const modalTheme = defineMultiStyleConfig({
    baseStyle,
    variants: { 
        stepModal,
    },
})
