import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface NotificationContextInterface {
    getNotification: Function,
    getNotificationIndex: Function,
    addNotification: Function,
    deleteNotifications: Function,
    listNotifications: Function,
    notificationsCount: number,
    updateCounter: number
}

export type Notification = {
    id: string,
    children: React.ReactElement,
    dateCreated: Date,
    closeable: boolean,
    severity: SeverityLevel,
    image?: JSX.Element,
    onOpen?: Function,
    onClose?: Function,
}

export interface NewNotification {
    id: string,
    children: React.ReactElement,
    dateCreated?: Date,
    closeable?: boolean,
    severity?: SeverityLevel,
    image?: JSX.Element,
    onOpen?: Function,
    onClose?: Function,
}

export enum SeverityLevel {
    Ok,
    Info,
    Major,
    Critical
}

export const NotificationContext = createContext<NotificationContextInterface|null>(null);

export function NotificationContextProvider({ children }:any) {

    const notifications = useRef<Notification[]>([])
    const [ updateCounter, setUpdateCounter ] = useState<number>(0)
    const notificationsCount = notifications.current.length

    const getNotification = (id: string) => {
        return notifications.current.find(it => it.id === id)
    }

    const getNotificationIndex = (id: string) => {
        return notifications.current.findIndex(it => it.id === id)
    }

    const addNotification = (newNotification: NewNotification) => {
        const existingIdx = notifications.current.findIndex(it => it.id === newNotification.id)
        const newData = {
            id: newNotification.id,
            children: newNotification.children,
            severity: (newNotification.severity === undefined) ? SeverityLevel.Info : newNotification.severity,
            dateCreated: newNotification.dateCreated || new Date(),
            closeable: (newNotification.closeable === undefined) ? true : newNotification.closeable,
            onOpen: newNotification.onOpen,
            image: newNotification.image
        }
        if (existingIdx > -1) {
            notifications.current[existingIdx] = newData
        } else {
            notifications.current.push(newData)
            newData.onOpen && newData.onOpen()
        }
        setUpdateCounter(updateCounter+1)
    }

    const deleteNotifications = (toDelete: any[]) => {
        if (toDelete.length > 0) {
            toDelete.forEach((notification) => {
                let id: string
                if (typeof notification === 'string') {
                    id = notification
                } else {
                    id = notification.id
                }
                const idx = getNotificationIndex(id)
                if (idx > -1) {
                    notifications.current.splice(idx, 1)
                    setUpdateCounter(updateCounter+1)
                    notification.onClose && notification.onClose()
                } else {
                    console.error('No such notification:', id)
                }
            })
        }
    }

    const defaultSort = (a: Notification, b: Notification) => {
        if ( a.dateCreated > b.dateCreated ){
            return -1;
        }
        if ( a.dateCreated < b.dateCreated ){
            return 1;
        }
        return 0;
    }

    const listNotifications = (compareFunction: Function = defaultSort) => {
        return notifications.current.sort(compareFunction as any)
    }

    return (
        <NotificationContext.Provider value={{
            getNotification,
            getNotificationIndex,
            addNotification,
            deleteNotifications,
            listNotifications,
            notificationsCount,
            updateCounter
        }}>
            {children}
        </NotificationContext.Provider>
    );
}