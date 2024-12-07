
import { useState, useCallback } from 'react';

const useLockedState = (initialValue) => {
    const [value, setValue] = useState(initialValue);
    const [isLocked, setIsLocked] = useState(false);

    const setLockedValue = useCallback((newValue) => {
        if (!isLocked) {
            setValue(newValue);
        }
    }, [isLocked]);

    const lock = useCallback(() => setIsLocked(true), []);
    const unlock = useCallback(() => setIsLocked(false), []);

    return [value, setLockedValue, lock, unlock];
};

export default useLockedState;