import { Badge, Box, Circle, Divider, Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react"
import { Period } from "../../../../hooks/useArbitratorGraph"
import { t } from "@lingui/macro"
import { HelpCircle } from '@web3uikit/icons'
import useTimeCounter, { formatDifference } from "../../../../hooks/useTimeCounter"
import { addTimestampToDate} from '../../../../utils/helpers';

const timers = [
    42 * 3600000, // Evidence
    0, // Commit
    90 * 3600000, // Vote
    84 * 3600000, // Appeal
    0, // Execute
]

interface KlerosCaseStepsInterface {
    period: Period|undefined,
    lastPeriodChange: Date|undefined
}

interface KlerosCaseStepInterface {
    active: boolean,
    passed: boolean,
    number: number,
    header: string,
    popoverText: string,
    activeText: string,
    inactiveText: string
}

const KlerosCaseStep = ({
    active,
    passed,
    header,
    number,
    popoverText,
    activeText,
    inactiveText
}: KlerosCaseStepInterface) => {
    return <Flex justifyContent="center" alignItems="center">
        <Flex justifyContent="center" alignItems="center" height="100%">
            <Circle
                fontSize={'14px'}
                fontWeight={0}
                size='24px'
                bg={active ? '#1316DD' : 'gray.light'}
                color={active ? 'white' : 'gray'}
                borderColor={active ? '#1316DD' : '#ADADAD'}
                border='1px'
                mr='1em'
            >
                {number}
            </Circle>
        </Flex>
        <Box>
            <Flex flexDirection="row" flexWrap="nowrap">
                <Text fontSize="14px" lineHeight="18px" fontWeight="600" whiteSpace='nowrap'>
                    {header}
                </Text>
                <Popover placement="bottom">
                    <PopoverTrigger>
                        <Box cursor="pointer" color="#2D7BD6" ml={[2]}>
                            <HelpCircle fontSize='20px' />
                        </Box>
                    </PopoverTrigger>
                    <PopoverContent w={{base: "280px"}} color="#FFF" bgColor="#030303" fontSize="14px" lineHeight="18px" textAlign="left">
                        <PopoverArrow bgColor="#030303"/>
                        <PopoverBody  borderRadius="16px" color="#FFF" px={{base: "10px"}} py={{base: "8px"}} >
                            {popoverText}
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Flex>
            <Text whiteSpace='nowrap' fontSize={'14px'}>
                { active ? activeText : inactiveText }
            </Text>
        </Box>
    </Flex>
}

const HorizontalDivider = () => {
    return <Box w='100%' mx='0.5em' height="2px" backgroundColor="gray.200"></Box>
}

const KlerosCaseSteps = ({
    period,
    lastPeriodChange
}: KlerosCaseStepsInterface) => {

    const timeDiff = period ? timers[period] : undefined
    const { formattedTime } = useTimeCounter(
        lastPeriodChange && timeDiff ?
        addTimestampToDate(lastPeriodChange, timeDiff) : 
        new Date()
    )

    return <Flex width='100%' justifyContent="center" alignItems="center">
        <KlerosCaseStep
            header={t`Evidence Period`}
            active={period === Period.Evidence || period === Period.Commit}
            passed={ (period !== undefined) && (period > Period.Commit) }
            number={1}
            popoverText={t`During the evidence submission period where all interested parties (disputing parties, jurors, challengers and any external agent) are able to submit their evidence.`}
            activeText={period === Period.Evidence ? formattedTime : formatDifference(0)}
            inactiveText={formatDifference(timers[Period.Evidence])}
        />
        <HorizontalDivider/>
        <KlerosCaseStep
            header={t`Voting Period`}
            active={period === Period.Vote}
            passed={ (period !== undefined) && (period > Period.Vote) }
            number={2}
            popoverText={t`During the voting period, Kleros Jurors make a determination and cast their votes in favor of one of the disputing parties.`}
            activeText={formattedTime}
            inactiveText={formatDifference(timers[Period.Vote])}
        />
        <HorizontalDivider/>
        <KlerosCaseStep
            header={t`Appealing Period`}
            active={period === Period.Appeal}
            passed={ (period !== undefined) && (period > Period.Appeal) }
            number={3}
            popoverText={t`During the appeal period, both parties can challenge the initial decision by paying a fee within 84 hours. If the appeal is funded, the dispute is reviewed again. If no appeal is made, the original decision is final and the case is resolved. If only one side pays the appeal fee, they win the dispute, regardless of the initial ruling.`}
            activeText={formattedTime}
            inactiveText={formatDifference(timers[Period.Appeal])}
        />
        <HorizontalDivider/>
        <KlerosCaseStep
            header={t`Decision Period`}
            active={period === Period.Execution}
            passed={ false }
            number={4}
            popoverText={t`The final ruling has been rendered and becomes binding.`}
            activeText={formattedTime}
            inactiveText={''}
        />
    </Flex>
}

export default KlerosCaseSteps