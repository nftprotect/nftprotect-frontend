import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

// Defining a custom variants
const primary = defineStyle({
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    fontSize: {base: '12px', lg: '14px'},
    lineHeight: {base: '16px', lg: '18px'},
    fontWeight: "500",
    errorBorderColor: "danger",
    _focus: {
        border: "2px solid",
        borderColor: "brand.light",
        boxShadow: "0px 0px 6px rgba(80, 36, 205, 0.25)"
    }
})

export const textareaTheme = defineStyleConfig({
    variants: { 
        primary,
    },
})
