// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import './Terminal.css';
import useLockedState from '../../hooks/useLockedState';
import details from '../../EnvironmentDetails';
import toggleTheme from '../../Components/toggleTheme';

const Terminal = () => {
    const terminalInputRef = useRef(null);
    const [value, setValue] = useLockedState("");
    const [init, doneInit] = useLockedState(false);
    const [ip, setIp] = useLockedState("");
    const [identifier, setIdentifier] = useLockedState("");
    const [cwd, setCwd] = useLockedState("~");
    const [minCursorPosition, setMinCursorPosition] = useLockedState(0);
    const [cursorPosition, setCursorPosition] = useLockedState(0);
    const [caret, setCaret] = useLockedState("█");
    const [isEditable, setIsEditable] = useLockedState(true);

    const printQueue = [];
    let isPrinting = false;

    const processQueue = async () => {
        if (isPrinting) return;
        isPrinting = true;
        while (printQueue.length > 0) {
            const { str, resolve } = printQueue.shift();
            await new Promise((res) => {
                setValue((prevValue) => {
                    const updatedValue = prevValue.slice(0, prevValue.length) + "\n" + str;
                    setMinCursorPosition(updatedValue.length);
                    setCursorPosition(updatedValue.length);
                    res(updatedValue);
                    return updatedValue; 
                });
            });
            resolve();
        }
        isPrinting = false;
    };

    const consolePrint = (str) => {
        return new Promise((resolve) => {
            setCaret("█");
            printQueue.push({ str, resolve });
            processQueue();
        });
    }

    useEffect(() => {
        const initTerminal = async () => {
            try {
                if (!init) {
                    setValue("Terminal application starting...\n")
                    const response = await fetch("https://api.ipify.org?format=json");
                    const data = await response.json();
                    setIp(data.ip);
                    const idtf = "root@" + data.ip + ":~$ ";
                    const msg = details.name + " Environment v" + details.version_major + "." + details.version_minor + "\n\nroot@" + data.ip + ":~$ ";
                    setIdentifier(idtf);
                    setValue(msg)
                    setMinCursorPosition(msg.length)
                    setCursorPosition(msg.length)
                    terminalInputRef.current.focus();
                    doneInit(true);
                }
            } catch (error) {
                console.log(error)
            }
        }
        initTerminal();
    }, [init]);

    const consoleMoveCaret = (str) => {
        setCursorPosition((prevPos) => {
            if (prevPos >= minCursorPosition) {
                setValue((prevValue) => {
                    return prevValue.slice(0, prevPos) + str + prevValue.slice(prevPos, prevValue.length)
                })
                return prevPos + str.length;
            }
            return prevPos;
        });
    }

    const consoleMoveCaretLeft = () => {
        if (extractCommand() === "") {
            return;
        }
        setCaret("│");
        setCursorPosition((prevPos) => {
            if (prevPos - 1 >= minCursorPosition) {
                return prevPos - 1;
            }
            return prevPos;
        });
    }

    const consoleMoveCaretRight = () => {
        setCursorPosition((prevPos) => {
            if (prevPos + 1 <= value.length) {
                if (prevPos + 1 == value.length) {
                    setCaret("█");
                } else {
                    setCaret("│");
                }
                return prevPos + 1;
            }
            return prevPos;
        });
    }

    const extractCommand = () => {
        return value.slice(minCursorPosition, value.length);
    }

    useEffect(() => {
        if (terminalInputRef.current) {
            terminalInputRef.current.scrollTop = terminalInputRef.current.scrollHeight;
        }
    }, [value]);

    const handleKeyDown = (event) => {
        const terminalInput = terminalInputRef.current;
        if (terminalInput) {
            if (event.key === "Enter") {
                event.preventDefault();
                runCommand(extractCommand());
            } else if (event.ctrlKey) {
                if (event.key === "c") {
                    event.preventDefault();
                    consolePrint("[^C] Terminated\n");
                }
            } else if (event.key === "Backspace") {
                event.preventDefault();
                if (cursorPosition - 1 >= minCursorPosition) {
                setCursorPosition((prevPos) => {
                    setValue((prevValue) => {
                        const updatedValue = prevValue.slice(0, prevPos - 1) + prevValue.slice(prevPos, prevValue.length)
                        return updatedValue;
                    });
                    return prevPos - 1;
                });
                }
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                consoleMoveCaretLeft();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                consoleMoveCaretRight();
            } else if (event.key === "Shift" || event.key === "Alt" || event.key === "Meta") {
                event.preventDefault();
            } else {
                event.preventDefault();
                consoleMoveCaret(event.key)
            }
        }
    };

    const runCommand = async (command) => {
        if (command !== "") {
            const args = command.split(" ");
            switch (args[0]) {
                case "help":
                    await consolePrint("List of commands:\n'help' - Shows this page\n'ip' - Prints your IP address to the console\n'version'- Prints the version of the environemnt to the console\n'toggleTheme' - Changes the color scheme of the system")
                    break;
                case "ip":
                    await consolePrint(ip)
                    break;
                case "version":
                    await consolePrint(details.name + " Environment v" + details.version_major + "." + details.version_minor)
                    break;
                case "toggleTheme":
                    toggleTheme()
                    await consolePrint("Theme changed")
                    break;
                default:
                    await consolePrint("\"" + args[0] + "\" - bad command or file name");
            }
        }
        await consolePrint(identifier);
    }

    return (
        <div className = "terminal">
            <textarea 
                className='terminal-input'
                // style={{ caretColor: "transparent" }} 
                ref={terminalInputRef}
                value={value}
                onKeyDown={handleKeyDown}
                onChange={(e) => setValue(e.target.value)}
                spellCheck={false}
                autoCorrect='false'
                autoComplete='false'
                readOnly={!isEditable}
            />
        </div>
    )
}

export default Terminal;


