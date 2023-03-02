import { extendTheme } from '@chakra-ui/react'
import type { StyleFunctionProps } from '@chakra-ui/styled-system'

const nftProtectTheme = extendTheme({
  components: {
    Button: {
      // 1. We can update the base styles
      baseStyle: {
        // fontWeight: 'bold', // Normally, it is "semibold"
      },
      // 3. We can add a new visual variant
      variants: {
            'monochrome-transparent': {
                border: "2px solid rgba(0, 0, 0, 0.8)",
                borderRadius: "8px",
                py: [2, 4],
                px: [3, 6],
                bg: "none",
                textTransform: "uppercase",
                _hover: {
                    bgColor: "rgba(255, 255, 255, 0.15)",
                    transform: "scale(1.03)"
                },
                _active: {
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }
            },
            'primary-solid': {
                type: 'button',
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "8px",
                bg: "linear-gradient(90deg, #4E22CE 5%, #5C2DBA 25%, #AF1893 100%)",
                color: "#FFF",
                whiteSpace: "break-spaces",
                fontSize: ['xs', 'sm', 'md', 'lg'],
                filter: "drop-shadow(-4px 4px 10px rgba(0, 0, 0, 0.25))",
                my: [2, 4],
                h: [8, 10],
                _hover: {
                    bgColor: "linear-gradient(-90deg, #4E22CE 5%, #5C2DBA 50%, #AF1893 100%)",
                    transform: "scale(1.03)"
                }
            },
            'primary-outline': {
                type: 'button',
                justifyContent: "center",
                h: [8, 10],
                bg: "none",
                border: "1px solid #BC9CFF",
                borderRadius: "8px",
                whiteSpace: "break-spaces",
                fontSize: ['xs', 'sm', 'md'],
                _hover: {
                    bgColor: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                    color: "#FFF"
                }
            },
            'danger': {
                textTransform: "uppercase",
                borderRadius: "16px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)",
                fontSize: ['sm', 'md', 'lg', 'xl'],
                p: [3, 6],
                color: "#FFF",
                bgColor: "#FF0000",
                w: "100%",
                _hover: {
                    transform: "scale(1.03)"
                },
                _active: {
                    color: "#FFF",
                    bgColor: "#FF0000",
                }
            }


        // // 4. We can override existing variants
        // solid: (props: StyleFunctionProps) => ({
        //   bg: props.colorMode === 'dark' ? 'red.300' : 'red.500',
        // }),
        // // 5. We can add responsive variants
        // sm: {
        //   bg: 'teal.500',
        //   fontSize: 'md',
        // },
      },
    //   6. We can overwrite defaultProps
      defaultProps: {
        // size: 'lg', // default is md
        // variant: 'sm', // default is solid
        // colorScheme: 'green', // default is gray
      },
    },
  },
})

export default nftProtectTheme