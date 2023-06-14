import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const baseStyle = defineStyle({
    borderWidth: '4px',
    emptyColor: 'gray.200',
    color: 'brand.light',
    label: "loading",
    h: {base: "80px"},
    w: {base: "80px"}
})

// Defining a custom variants
const primary = defineStyle({
    h: {base: "110px"},
    w: {base: "110px"}
})

export const spinnerTheme = defineStyleConfig({
    baseStyle,
    variants: { 
        primary,
    },
})