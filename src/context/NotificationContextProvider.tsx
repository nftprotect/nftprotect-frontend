import { createContext, useContext, useEffect, useState } from "react";

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
    severity: SeverityLevel,
    dateCreated: Date,
    closeable: boolean,
    callback: Function|undefined,
    image: {url: string, text: string}|undefined
}

export enum SeverityLevel {
    Ok,
    Info,
    Major,
    Critical
}

export const NotificationContext = createContext<NotificationContextInterface|null>(null);

export function NotificationContextProvider({ children }:any) {

    const [ notifications, setNotifications ] = useState<Notification[]>([])
    const [ updateCounter, setUpdateCounter ] = useState<number>(0)
    const notificationsCount = notifications.length

    const getNotification = (id: string) => {
        return notifications.find(it => it.id === id)
    }

    const getNotificationIndex = (id: string) => {
        return notifications.findIndex(it => it.id === id)
    }

    const addNotification = (newNotification: {
        id: string, 
        children: React.ReactElement,
        severity: SeverityLevel|undefined,
        dateCreated: Date|undefined,
        closeable: boolean|undefined,
        callback: Function|undefined,
        image: {url: string, text: string}|undefined
    }) => {
        const existingIdx = notifications.findIndex(it => it.id === newNotification.id)
        const updatedNotifications = [...notifications]
        const newData = {
            id: newNotification.id,
            children: newNotification.children,
            severity: (newNotification.severity === undefined) ? SeverityLevel.Info : newNotification.severity,
            dateCreated: newNotification.dateCreated || new Date(),
            closeable: (newNotification.closeable === undefined) ? true : newNotification.closeable,
            callback: newNotification.callback,
            image: newNotification.image
        }
        if (existingIdx > -1) {
            updatedNotifications[existingIdx] = newData
        } else {
            updatedNotifications.push(newData)
        }
        setNotifications(updatedNotifications)
        setUpdateCounter(updateCounter+1)
    }

    const deleteNotifications = (toDelete: any[]) => {
        const newState = [...notifications]
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
                    newState.splice(idx, 1)
                } else {
                    console.error('No such notification:', id)
                }
            })
            if (notifications.length > newState.length) {
                setNotifications(newState)
                setUpdateCounter(updateCounter+1)
            }
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
        return notifications.sort(compareFunction as any)
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