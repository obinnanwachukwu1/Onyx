import React, {useContext} from "react";
import { WindowManagerContext } from "./WindowManagerContext";
import { AppManagerContext } from "./AppManagerContext";

export const useWindowContext = () => {
    const windowManagerContext = useContext(WindowManagerContext);
    const appManagerContext = useContext(AppManagerContext);
    
    const isInsideWindowManager = windowManagerContext !== undefined;
    
    return isInsideWindowManager ? windowManagerContext : appManagerContext;
};