import { createContext, useContext, useRef } from "react";

export interface CallableDialogContextInterface {
    getDialog: Function,
    setDialog: Function
}

export interface Dialog {
    id: string,
    dialog: DialogInterface
}

export interface DialogInterface {
    isOpen: boolean,
    onOpen: Function,
    onClose: Function,
    onToggle: Function,
    isControlled: boolean,
    getButtonProps: Function,
    getDisclosureProps: Function
}

const CallableDialogContext = createContext<CallableDialogContextInterface|null>(null);

export function CallableDialogContextProvider({ children }:any) {

    const dialogs = useRef<Array<Dialog>>([])
    
    const getDialog = (id: string) => {
        const dialog = dialogs.current.find((dialog: Dialog) => dialog.id === id);
        if (!dialog) {
          throw Error(`Dialog ${id} is not registered!`);
        } else {
          return dialog.dialog;
        }
      };
    
    const setDialog = (id: string, dialog: DialogInterface) => {
        dialogs.current.push({ id, dialog })
    };

    return (
        <CallableDialogContext.Provider value={{
            getDialog,
            setDialog
        }}>
            {children}
        </CallableDialogContext.Provider>
    );
}

export function useCallableDialogContext() {
    const currentContext = useContext(CallableDialogContext);
    if (!currentContext) {
        throw new Error(
            "useCallableDialogContext has to be used within <CallableDialogContext.Provider>"
        );
    }
    return currentContext;
}