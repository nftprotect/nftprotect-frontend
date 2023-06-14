import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const baseStyle = defineStyle({
    textTransform: 'uppercase',
    borderRadius: '8px',
    w: "100%",
    boxShadow: "boxShadow.active"
})

// Defining a custom variants
const darkOutline = defineStyle({
    fontSize: {base: "12px", md: '14px'},
    lineHeight: {base: '12px', md: '18px'},
    border: "2px solid #000",
    bg: "none",
    _hover: {
        bgColor: "rgba(255, 255, 255, 0.15)",
    },
    _active: {
        bgColor: "rgba(255, 255, 255, 0.15)"
    }
})

const primaryLight = defineStyle({
    fontSize: {base: "12px", md: '14px'},
    lineHeight: {base: '12px', md: '18px'},
    fontWeight: "600",
    border: "none",
    bgColor: "brand.light",
    color: "#FFF",
    boxShadow: "boxShadow.notActive",
    _hover: {
        bgColor: "brand.dark",
    },
    _active: {
        bgColor: "brand.dark",
    }
})

const primaryDark = defineStyle({
    fontSize: {base: "12px", md: '14px'},
    lineHeight: {base: '12px', md: '18px'},
    fontWeight: "600",
    border: "none",
    bgColor: "brand.dark",
    color: "#FFF",
    boxShadow: "boxShadow.notActive",
    _hover: {
        bgColor: "brand.light",
    },
    _active: {
        bgColor: "brand.dark",
    }
})

const primaryOutline = defineStyle({
    fontSize: {base: "12px", md: '14px'},
    lineHeight: {base: '12px', md: '18px'},
    justifyContent: "center",
    bg: "none",
    border: "2px solid",
    borderColor: "brand.light",
    _hover: {
        bgColor: "brand.dark",
        color: "#FFF"
    }
})

const danger = defineStyle({
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)",
    p: [3, 6],
    color: "#FFF",
    bgColor: 'danger',
    _hover: {
        transform: "scale(1.03)"
    },
    _active: {
        color: "#FFF",
        bgColor: "#FF0000"
    }
})

export const buttonTheme = defineStyleConfig({
    baseStyle,
    variants: { 
        darkOutline,
        primaryLight,
        primaryDark,
        primaryOutline,
        danger,
    },
})