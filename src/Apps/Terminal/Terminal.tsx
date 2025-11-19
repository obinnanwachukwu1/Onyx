// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import './Terminal.css';
import useLockedState from '../../hooks/useLockedState';
import details from '../../EnvironmentDetails';
import toggleTheme from '../../Components/toggleTheme';

const Terminal = () => {
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const initStartedRef = useRef(false);
    
    // Terminal State
    const [output, setOutput] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [cursorPos, setCursorPos] = useState(0);
    const [prompt, setPrompt] = useState("~$ ");
    
    // System State
    const [init, doneInit] = useLockedState(false);
    const [ip, setIp] = useLockedState("");
    const [user, setUser] = useState("root");
    
    // History State
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(null);

    // Scroll to bottom when output changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [output, inputVal]);

    // Focus input on click
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    // Initialize
    useEffect(() => {
        const initTerminal = async () => {
            if (!init && !initStartedRef.current) {
                initStartedRef.current = true;
                addToOutput("Terminal application starting...\n");
                try {
                    const response = await fetch("https://api.ipify.org?format=json");
                    const data = await response.json();
                    setIp(data.ip);
                    const newPrompt = `root@${data.ip}:~$ `;
                    setPrompt(newPrompt);
                    
                    const welcomeMsg = `${details.name} Environment v${details.version_major}.${details.version_minor}`;
                    setOutput([welcomeMsg]);
                } catch (e) {
                    console.error(e);
                    setPrompt("root@localhost:~$ ");
                }
                doneInit(true);
            }
        };
        initTerminal();
    }, [init]);

    const addToOutput = (text) => {
        setOutput(prev => [...prev, text]);
    };

    const handleInputChange = (e) => {
        setInputVal(e.target.value);
        setCursorPos(e.target.selectionStart);
    };

    const handleInputSelect = (e) => {
        setCursorPos(e.target.selectionStart);
    };

    const navigateHistory = (direction) => {
        if (history.length === 0) return;

        let newIndex;
        if (historyIndex === null) {
            if (direction === 'up') {
                newIndex = history.length - 1;
            } else {
                return;
            }
        } else {
            if (direction === 'up') {
                newIndex = historyIndex > 0 ? historyIndex - 1 : 0;
            } else {
                newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : null;
            }
        }

        setHistoryIndex(newIndex);
        
        const newVal = newIndex === null ? "" : history[newIndex];
        setInputVal(newVal);
        // Move cursor to end of new value
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.selectionStart = inputRef.current.selectionEnd = newVal.length;
                setCursorPos(newVal.length);
            }
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runCommand(inputVal);
            setInputVal("");
            setCursorPos(0);
            setHistoryIndex(null);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory('down');
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            addToOutput(`${prompt}${inputVal}^C`);
            setInputVal("");
            setCursorPos(0);
        }
    };

    const runCommand = async (cmd) => {
        // Echo the command to output
        addToOutput(`${prompt}${cmd}`);
        
        if (!cmd.trim()) return;

        setHistory(prev => [...prev, cmd]);
        
        const args = cmd.trim().split(/\s+/);
        const command = args[0];

        switch (command) {
            case "help":
                addToOutput("List of commands:\n'help' - Shows this page\n'ip' - Prints your IP address\n'version' - Prints version\n'toggleTheme' - Changes theme\n'clear' - Clears terminal\n'echo' - Prints text\n'date' - Prints date\n'whoami' - Prints user");
                break;
            case "ip":
                addToOutput(ip || "Loading...");
                break;
            case "version":
                addToOutput(`${details.name} Environment v${details.version_major}.${details.version_minor}`);
                break;
            case "toggleTheme":
                toggleTheme();
                addToOutput("Theme changed");
                break;
            case "clear":
                setOutput([]);
                break;
            case "echo":
                addToOutput(args.slice(1).join(" "));
                break;
            case "date":
                addToOutput(new Date().toString());
                break;
            case "whoami":
                addToOutput(user);
                break;
            default:
                addToOutput(`"${command}" - command not found`);
        }
    };

    // Render the input line with custom cursor
    const renderInputLine = () => {
        const beforeCursor = inputVal.slice(0, cursorPos);
        const atCursor = inputVal[cursorPos] || " "; // Space if at end
        const afterCursor = inputVal.slice(cursorPos + 1);

        return (
            <div className="terminal-input-line">
                <span className="terminal-prompt">{prompt}</span>
                <span className="terminal-input-content">
                    <span>{beforeCursor}</span>
                    <span className="terminal-cursor">{atCursor}</span>
                    <span>{afterCursor}</span>
                </span>
            </div>
        );
    };

    return (
        <div className="terminal" ref={containerRef} onClick={handleContainerClick}>
            <div className="terminal-output">
                {output.map((line, i) => (
                    <div key={i} className="terminal-line">{line}</div>
                ))}
            </div>
            {renderInputLine()}
            <input
                ref={inputRef}
                className="hidden-input"
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={handleInputSelect}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
            />
        </div>
    );
};

export default Terminal;
