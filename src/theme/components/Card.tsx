import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys);

// define the base component styles
const baseStyle = definePartsStyle({
    // define the part you're going to style
    container: {
        
    },
    header: {

    },
    body: {

    },
    footer: {

    }
});

// define custom variant
const variants = {
    stepContent: definePartsStyle({
        container: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            py: {base: "33px"},
            px: {base: "26px"}
        },
        header: {
            dispaly: "flex",
            textTransform: "uppercase",
            textAlign: "center",
            fontWeight:"700",
            p: "0",
            m: "0"
        },
        body: {
            display: "flex",
            flexDirection:"column",
            alignItems: "center",
            p: "0",
            m: "0"
        },
        footer: {
            display: "flex",
            flexDirection: "row",
            flexWrap: {base: "wrap", sm: "nowrap"},
            alignSelf: "flex-start",
            justifyContent: "space-evenly",
            w: "100%",
            p: "0",
            m: "0"
        },
    })
};

// export the component theme
export const cardTheme = defineMultiStyleConfig({
    baseStyle,
    variants,
});
