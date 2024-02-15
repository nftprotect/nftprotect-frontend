import { Box, Circle, Stack, Text, VStack } from '@chakra-ui/react';
import { t } from '@lingui/macro';

interface StepProps {
    number: number;
    text: string;
}

const Step = ({ number, text }: StepProps) => (
    <Stack direction="row" align="center">
        <Circle 
            size="2.6rem" 
            bg="transparent" 
            border="2px solid" 
            borderColor="#1316DD" 
            color="#1316DD"
        >
            <Text 
                fontSize="22px"
                fontWeight="regular"
            >
                {number}
            </Text>
        </Circle>
        <Text 
            pl={2}
            fontSize={'22px'}
            fontWeight="regular"
        >
            {text}
        </Text>
    </Stack>
);

const ReferralSteps = () => {
    const steps = [
        t`Share your referral link.`,
        t`Your friend signs up using your link.`,
        t`Your friend protects an NFT.`,
        t`You get 5% comission for every protection.`,
        t`Your friend gets a coupon for one free protection.`
    ];

    return (
        <VStack align="stretch" spacing={0}>
            {steps.map((text, index) => (
                <Box key={index}>
                    {index > 0 && <Box 
                        height="1rem" 
                        bg="#1316DD" 
                        width="2px" 
                        alignSelf="center" 
                        ml='1.3rem'

                    />}
                    <Step number={index + 1} text={text} />
                </Box>
            ))}
        </VStack>
    );
};

export default ReferralSteps;