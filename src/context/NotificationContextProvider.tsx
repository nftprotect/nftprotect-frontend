import { Notification } from "@web3uikit/core";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface NotificationContextInterface {
    getNotification: Function,
    getNotificationIndex: Function,
    addNotification: Function,
    deleteNotification: Function,
    listNotifications: Function,
    clearNotifications: Function,
    notificationsCount: number,
    updateCounter: number,
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
    buttonCallback?: React.MouseEventHandler<HTMLButtonElement>
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
    buttonCallback?: React.MouseEventHandler<HTMLButtonElement>
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

    const getNotification = (id: string): Notification|undefined => {
        return notifications.current.find(it => it.id === id)
    }

    const getNotificationIndex = (id: string): number => {
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
            image: newNotification.image,
            buttonCallback: newNotification.buttonCallback
        }
        if (existingIdx > -1) {
            notifications.current[existingIdx] = newData
        } else {
            notifications.current.push(newData)
            newData.onOpen && newData.onOpen()
        }
        setUpdateCounter(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
    }

    const deleteNotification = (toDelete: Notification|string) => {
        const notification = (typeof toDelete === 'string') ?
            getNotification(toDelete) :
            toDelete
        const idx = notification ?
            getNotificationIndex(notification.id) : 
            -1
        if (idx > -1) {
            notifications.current.splice(idx, 1)
            setUpdateCounter(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
            notification?.onClose && notification.onClose()
        } else {
            console.error('No such notification:', toDelete)
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

    const clearNotifications = () => {
        notifications.current = []
        setUpdateCounter(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
    }

    return (
        <NotificationContext.Provider value={{
            getNotification,
            getNotificationIndex,
            addNotification,
            deleteNotification,
            listNotifications,
            notificationsCount,
            updateCounter,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}