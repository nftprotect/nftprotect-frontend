import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

// define the base component styles
const baseStyle = definePartsStyle({
    // define the part you're going to style
    button: {
        // this will style the MenuButton component
    },
    list: {
        // this will style the MenuList component
        bgColor: "brand.dark",
        _hover: {
            bgColor: "brand.light",
        }
    },
    item: {
        // this will style the MenuItem and MenuItemOption components
        fontSize: ['xs', 'sm', 'md'],
        bg: "none",
        _hover: {
            bgColor: "rgba(255, 255, 255, 0.15)",
        },
        _active: {
            bgColor: "rgba(255, 255, 255, 0.15)",
        }
    },
    groupTitle: {
        // this will style the text defined by the title prop
        // in the MenuGroup and MenuOptionGroup components
    },
    command: {
        // this will style the text defined by the command prop in the MenuItem and MenuItemOption components
    },
    divider: {
        // this will style the MenuDivider component
    },
})

    // define custom variants
    const variants = {

    };

    // export the component theme
    export const menuTheme = defineMultiStyleConfig({
    baseStyle,
    variants,
})