import { extendTheme } from '@chakra-ui/react';

// Global style overrides
import { styles } from './styles'

// Foundational style overrides
import { colors } from './foundations/colors'

import { menuTheme } from './components/Menu';
import { cardTheme } from './components/Card';
import { buttonTheme } from './components/Button';
import { modalTheme } from './components/Modal';
import { spinnerTheme } from './components/Spinner';
import { textareaTheme } from './components/Textarea';

const nftProtectTheme = extendTheme({
    styles,
    colors,
    fonts: {
        heading: `'Lexend', sans-serif`,
        body: `'Lexend', sans-serif`,
    },
    textStyles: {
        h1: {
            fontSize: '3rem', 

            //fontSize: {base: '3rem', lg: '1.5rem'},
            pb: '0,5rem',
            lineHeight: '3rem',
            //fontSize: {base: '52px', lg: '62px'},
            //lineHeight: {base: '52px', lg: '62px'},
            fontWeight: {base: 'bold'}
        },
        h2: {
            fontSize: '2rem', 

            //fontSize: {base: '2rem', lg: '1.5rem'},
            lineHeight: '2.5rem',
            //fontSize: {base: '44px', lg: '44px'},
            //lineHeight: {base: '55px', lg: '55px'},
            fontWeight: {base: 'bold'}
        },
        h3: {
            fontSize: '1.375rem', 

            //fontSize: {base: '1.375rem', lg: '1rem'}, 
            lineHeight: '1,25rem', 
            //fontSize: {base: '18px', lg: '22px'},
            //lineHeight: {base: '23px', lg: '28px'},
            fontWeight: {base: 'regular'}
        },
        paragraph: {
            fontSize: '0.875rem',
            lineHeight: '0,875rem',
            //fontSize: {base: '12px', lg: '14px'},
            //lineHeight: {base: '16px', lg: '18px'},
            fontWeight: {base: 'regular'}
        },
        tips: {
            fontSize: '0.625rem',
            lineHeight: '0,625rem',
            //fontSize: {base: '10px', lg: '10px'},
            //lineHeight: {base: '13px', lg: '13px'},
            fontWeight: {base: 'regular'}
        },
    },

    // Component style overrides
    components: {
        Menu: menuTheme,
        Card: cardTheme,
        Button: buttonTheme,
        Modal: modalTheme,
        Spinner: spinnerTheme,
        Textarea: textareaTheme,
    },
})

export default nftProtectTheme