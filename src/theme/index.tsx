import { extendTheme } from '@chakra-ui/react';

// Global style overrides
import { styles } from './styles'

// Foundational style overrides
import { colors } from './foundations/colors'
import { typography } from './foundations/typography'

import { StepsTheme as Steps } from 'chakra-ui-steps';
import { menuTheme } from './components/Menu';
import { cardTheme } from './components/Card';
import { buttonTheme } from './components/Button';
import { modalTheme } from './components/Modal';
import { spinnerTheme } from './components/Spinner';
import { textareaTheme } from './components/Textarea';

const nftProtectTheme = extendTheme({
    styles,
    colors,
    typography,
    boxShadow: {
        active: "0px 2px 16px rgba(0, 0, 0, 0.25)",
        notActive: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    },

    textStyles: {
        h1: {
            fontSize: {base: '52px', lg: '62px'},
            lineHeight: {base: '52px', lg: '62px'},
            fontWeight: {base: 'bold'}
        },
        h2: {
            fontSize: {base: '44px', lg: '44px'},
            lineHeight: {base: '55px', lg: '55px'},
            fontWeight: {base: 'bold'}
        },
        h3: {
            fontSize: {base: '18px', lg: '22px'},
            lineHeight: {base: '23px', lg: '28px'},
            fontWeight: {base: 'regular'}
        },
        paragraph: {
            fontSize: {base: '12px', lg: '14px'},
            lineHeight: {base: '16px', lg: '18px'},
            fontWeight: {base: 'regular'}
        },
        tips: {
            fontSize: {base: '10px', lg: '10px'},
            lineHeight: {base: '13px', lg: '13px'},
            fontWeight: {base: 'regular'}
        },
    },

    // Component style overrides
    components: {
        Steps,
        Menu: menuTheme,
        Card: cardTheme,
        Button: buttonTheme,
        Modal: modalTheme,
        Spinner: spinnerTheme,
        Textarea: textareaTheme,
    },
})

export default nftProtectTheme