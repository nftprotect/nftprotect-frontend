import { useEffect, useMemo, useState } from "react"

const updateTimeout = 10000

export const formatDifference = (diff: number): string => {
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    const formattedMinutes = minutes % 60;
    const formattedHours = hours % 24;
    const formattedDays = days;
  
    return `${formattedDays}d ${formattedHours.toString().padStart(2, '0')}h ${formattedMinutes.toString().padStart(2, '0')}m`;
}

const useTimeCounter = (targetDate: Date) => {

    const [ timeLeft, setTimeLeft ] = useState<number>()

    const calculateTimeLeft = () => {
        const currentDate = new Date()
        let diff = targetDate.getTime() - currentDate.getTime()
        diff = (diff < 0) ? 0 : diff
        setTimeLeft(diff)
        setTimeout(calculateTimeLeft, updateTimeout)
    }

    const formattedTime = (timeLeft !== undefined) ? 
        formatDifference(timeLeft) :
        formatDifference(0)

    useEffect( calculateTimeLeft, [])

    return {
        formattedTime
    }
}

export default useTimeCounter