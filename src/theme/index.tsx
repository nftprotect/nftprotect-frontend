import { extendTheme } from '@chakra-ui/react'

const nftProtectTheme = extendTheme({
    colors: {
        dark: '#0D0E14',
        lightGray: '#F2F2F2',
        accent: {
            light: '#5024CD',
            dark: '#AA1A97',
        },
        danger: '#FF0000',
    },

    fonts: {
        heading: `'Lexend', sans-serif`,
        body: `'Lexend', sans-serif`,
    },

    textStyles: {
        h1: {
            fontSize: {base: '52px', xl: '62px'},
            lineHeight: {base: '52px', xl: '62px'},
            fontWeight: {base: 'bold'}
        },
        h2: {
            fontSize: {base: '44px', xl: '44px'},
            lineHeight: {base: '55px', xl: '55px'},
            fontWeight: {base: 'regular'}
        },
        h3: {
            fontSize: {base: '18px', xl: '22px'},
            lineHeight: {base: '23px', xl: '28px'},
            fontWeight: {base: 'regular'}
        },
        paragraph: {
            fontSize: {base: '12px', xl: '14px'},
            lineHeight: {base: '16px', xl: '18px'},
            fontWeight: {base: 'regular'}
        },
        tips: {
            fontSize: {base: '10px', xl: '10px'},
            lineHeight: {base: '13px', xl: '13px'},
            fontWeight: {base: 'regular'}
        },
    },

    components: {
        Button: {
            baseStyle: {
                textTransform: "uppercase",
                fontStyle: 'paragraph',
                borderRadius: "16px"
            },
            variants: {
                'light-outline': {
                    border: "2px solid #FFF",
                    bg: "none",
                    _hover: {
                        bgColor: "rgba(255, 255, 255, 0.15)",
                        transform: "scale(1.03)"
                    },
                    _active: {
                        bgColor: "rgba(255, 255, 255, 0.15)"
                    }
                },
                'dark-outline': {
                    border: "2px solid #000",
                    bg: "none",
                    _hover: {
                        bgColor: "rgba(255, 255, 255, 0.15)",
                        transform: "scale(1.03)"
                    },
                    _active: {
                        bgColor: "rgba(255, 255, 255, 0.15)"
                    }
                },
                'primary-solid': {
                    border: "none",
                    bgGradient: "linear(315deg, accent.dark 0%, accent.light 100%)",
                    color: "#FFF",
                    filter: "drop-shadow(-4px 4px 10px rgba(0, 0, 0, 0.25))",
                    fontWeight: "600",
                    py:{base: "1rem", xl: "1.5rem"},
                    px:{base: "2rem", xl: "3rem"},
                    w: "100%",
                    _hover: {
                        bgGradient: "linear(315deg, accent.light 0%, accent.dark 100%)",
                        transform: "scale(1.03)"
                    }
                },
                'primary-outline': {
                    justifyContent: "center",
                    bg: "none",
                    border: "2px solid #BC9CFF",
                    borderRadius: "16px",
                    _hover: {
                        bgGradient: "linear(315deg, accent.light 0%, accent.dark 100%)",
                        color: "#FFF"
                    }
                },
                'danger': {
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)",
                    p: [3, 6],
                    color: "#FFF",
                    bgColor: 'danger',
                    w: "100%",
                    _hover: {
                        transform: "scale(1.03)"
                    },
                    _active: {
                        color: "#FFF",
                        bgColor: "#FF0000",
                    }
                }
            },
        },
    },
})

export default nftProtectTheme