import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

// Defining a custom variants
const primary = defineStyle({
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    fontSize: {base: '12px', lg: '14px'},
    lineHeight: {base: '16px', lg: '18px'},
    fontWeight: "500",
    errorBorderColor: "danger",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    _focus: {
        border: "2px solid",
        borderColor: "brand.light",
        boxShadow: "0px 2px 16px rgba(0, 0, 0, 0.1)"
    }
})

export const textareaTheme = defineStyleConfig({
    variants: { 
        primary,
    },
})
