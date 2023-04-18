import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useWizard } from 'react-use-wizard';

interface SwitchableOutsideInitialData {
    children: any,
    nextStepNumber: number
}

const SwitchableOutside = React.memo( function SwitchableOutside({children, nextStepNumber}: SwitchableOutsideInitialData) {
    const { goToStep, activeStep } = useWizard()

    const variants: Variants = {
        // enter: (direction: number) => {
        //   return {
        //     x: direction > 0 ? 800 : -800,
        //     opacity: 0,
        //   };
        // },
        // center: {
        //   zIndex: 1,
        //   x: 0,
        //   opacity: 1,
        // },
        // exit: (direction: number) => {
        //   return {
        //     zIndex: 0,
        //     x: direction < 0 ? 800 : -800,
        //     opacity: 0,
        //   };
        // },
      };

    useEffect(() => {
        if (nextStepNumber && (nextStepNumber != activeStep)) {
            goToStep(nextStepNumber)
        }
    }, [nextStepNumber])

    return (
        <motion.div
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
            }}
        >
            { children }
        </motion.div>
    )
})

export default SwitchableOutside