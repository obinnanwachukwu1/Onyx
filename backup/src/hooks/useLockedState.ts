import { useCallback, useState } from 'react';

type Updater<T> = T | ((previous: T) => T);

type LockedStateTuple<T> = [
  T,
  (value: Updater<T>) => void,
  () => void,
  () => void,
];

const useLockedState = <T>(initialValue: T): LockedStateTuple<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const setLockedValue = useCallback(
    (newValue: Updater<T>) => {
      if (!isLocked) {
        setValue((previous) => (typeof newValue === 'function' ? (newValue as (prev: T) => T)(previous) : newValue));
      }
    },
    [isLocked],
  );

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => setIsLocked(false), []);

  return [value, setLockedValue, lock, unlock];
};

export default useLockedState;
