import { useReferralLink } from "../../hooks/useReferralLink";
import { Input, Button, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useClipboard } from "@chakra-ui/hooks";

const ReferralLink = () => {
    const referralLink = useReferralLink() || 'No referral link available';
    const { hasCopied, onCopy } = useClipboard(referralLink);

    return (
        <InputGroup size="md">
            <Input
                value={referralLink}
                isReadOnly
                variant="filled"
                isTruncated
                color="#1316DD"
                borderColor="#1316DD"
                borderRadius="4"
                _hover={{ borderColor: "#1316DD" }}
                pl="1rem"
                pr="8rem"
            />
            <InputRightElement width="7rem">
                <Button 
                    h="100%"
                    size="sm" 
                    onClick={referralLink ? onCopy : undefined}
                    bgColor='#1316DD'
                    borderRadius="4"
                    colorScheme="blue"
                    color="white"
                >
                    {hasCopied ? "Copied!" : "Copy"}
                </Button>
            </InputRightElement>
        </InputGroup>
    );
};

export default ReferralLink;