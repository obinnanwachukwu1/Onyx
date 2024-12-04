import React, { useState, useRef, useEffect } from 'react';
import Window from './Window';
import Taskbar from './Taskbar/Taskbar';
import IconNewWindow from "./assets/icons/IconNewWindow.svg"
import "./App.css"
import DesktopIcon from './Desktop/DesktopIcon';
import IconNotepad from "./assets/icons/IconNotepad.svg"
import { ContextMenu, ContextMenuItem } from './Components/ContextMenu';
import Launcher from './Launcher/Launcher';

function App() {
  const [windows, setWindows] = useState([]);
  const [closingWindowID, setClosingWindowID] = useState(-1);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [buttonPositions, setButtonPositions] = useState({}); // Store taskbar button positions
  const [contextMenu, setContextMenu] = useState(null);
  const [isLauncherVisible, setIsLauncherVisible] = useState(false);
  const taskbarRef = useRef(null);

  const handleRightClick = (e, val) => {
    e.stopPropagation();
    e.preventDefault();
    setAllInactive();
    const contextMenuItems = [
      { label: 'Change Wallpaper', onClick: () => console.log("Hello World")}
    ];

    const contextMenuPosition = { x: e.clientX, y: e.clientY };

    setContextMenu({
      items: contextMenuItems,
      position: contextMenuPosition,
      visible: true
    });
  };

  const setButtonPosition = (id, position) => {
    setButtonPositions((prevPositions) => ({
      ...prevPositions,
      [id]: position,
    }));
  };

  // Function to create a new window
  const spawnWindow = (title, content, sz) => {
      const newWindow = {
        id: Date.now(),
        title: title,
        content: content,
        position: { x: 100, y: 100 },
        size: sz,
        minSize: sz,
        restorePosition:{ x: 100, y: 100 },
        restoreSize: sz,
        isMaximized: false,
        isMinimized: false,
        isRestoring: false,
        showInTaskbar: true,
        active: true,
      };
      setWindows([...windows, newWindow]);
      setActiveWindowId(newWindow.id);
    };

  // Function to handle window actions before the closing animation starts
  const preCloseWindow = (id) => {
    if (closingWindowID === -1) {
      setClosingWindowID(id);
      setWindows((prevWindows) =>
        prevWindows.map((window) =>
          window.id === id
            ? { ...window, showInTaskbar: false}
            : window
        )
      );
    }
  };

  const updateWindowPosition = (id, newPosition) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, position: newPosition, restorePosition: newPosition } : window
      )
    );
  };

  const setWindowSize = (id, sz) => {
    const minSize = windows.find((window) => window.id === id).minSize;
    const newSz = {width: Math.max(sz.width, minSize.width), height: Math.max(sz.height, minSize.height)};
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, size: newSz, restoreSize: newSz, isMaximized: false } : window
      )
    );
  };

  const setdoRestoreFromTaskbar = (id, val) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, doRestoreFromTaskbar: val } : window
      )
    );
  }

  const closeWindow = (id) => {
    setWindows(windows.filter(window => window.id !== id));
    if (id === activeWindowId) setActiveWindowId(null); // Reset active window if it was closed
    setClosingWindowID(-1);
  };

  // Function to bring a window to the front (make it active)
  const activateWindow = (id) => {
    setIsLauncherVisible(false);
    setActiveWindowId(id);
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? ( window.isMinimized ? 
          { ...window, doRestoreFromTaskbar: true, isMinimized: false, active: true} 
          : { ...window, active: true}
        ) 
          : { ...window, active: false }
      )
    );
  };

  const setAllInactive = (e) => {
    // Check if click is inside launcher
    const launcherElement = document.querySelector('.launcher');
    if (launcherElement && launcherElement.contains(e.target)) {
      return;
    }
    
    setActiveWindowId(null);
    setContextMenu(null);
    setIsLauncherVisible(false);
    setWindows((prevWindows) =>
      prevWindows.map((window) => ({
        ...window,
        active: false,
      }))
    );
  };

  const minimizeWindow = (id) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, isMinimized: true, minimizing: false } : window
      )
    );
  };

  const maximizeWindow = (id) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === id ? { ...w, isMaximized: true, size: {width: window.innerWidth, height: (window.innerHeight - taskbarRef.current.clientHeight)}, position: {x: 0, y: 0}} : w
      )
    );
  }

  const restoreWindow = (id) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === id ? { ...w, isMaximized: false, size: w.restoreSize, position: w.restorePosition} : w
      )
    );
  }

  const setIsMaximized = (id, val) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === id ? { ...w, isMaximized: false} : w
      )
    );
  }

  const preMaximizeWindow = ()=> {
    document.documentElement.style.setProperty('--width', `${window.innerWidth}px`);
    document.documentElement.style.setProperty('--height', `${window.innerHeight - taskbarRef.current.clientHeight}px`);
  }

  const preRestoreWindow = (id) => {
    const sz = windows.find((window) => window.id ==id).restoreSize;
    const pos = windows.find((window) => window.id ==id).restorePosition;
    console.log(pos);

    document.documentElement.style.setProperty('--width', `${sz.width}px`);
    document.documentElement.style.setProperty('--height', `${sz.height}px`);
    document.documentElement.style.setProperty('--dx', `${pos.x}px`);
    document.documentElement.style.setProperty('--dy', `${pos.y}px`);
  }

  const getTaskbarTransformPos = (id) => {
    const taskbarButtonPosition = buttonPositions[id];
    const windowPosition = windows.find((window) => window.id === id).position;

    // Calculate the distance to animate
    const dx = taskbarButtonPosition.left - windowPosition.x;
    const dy = taskbarButtonPosition.top - windowPosition.y;
  
    // Add a CSS variable to handle the transform values
    document.documentElement.style.setProperty('--dx', `${dx}px`);
    document.documentElement.style.setProperty('--dy', `${dy}px`);
  };
  
  const toggleLauncher = () => {
    setIsLauncherVisible(!isLauncherVisible);
  };

  const closeLauncher = () => {
    setIsLauncherVisible(false);
  };

  return (
    <div className="desktop" onMouseDown={setAllInactive} onContextMenu={(e) => handleRightClick(e, 1)}>
      <DesktopIcon imageSrc={IconNewWindow} text={"Test Window"} onClick={() => spawnWindow(
        "Hello World", 
        <div style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1e3c72, #2a5298, #0f2027)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // boxShadow: '0 0 20px #88f, 0 0 40px #88f',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '20px',
          lineHeight: '1.5',
          animation: 'glow 2s infinite alternate'
        }}>
          <p>Step through the portal<br/>into a world<br/>of endless possibilities.</p>
        </div>, 
        {width: 500, height:500})}/>
      <DesktopIcon imageSrc={IconNotepad} text={"Notepad"} onClick={() => spawnWindow(
        "Notepad", 
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: "100%",
          height: "100%",
        }}>
          <textarea style={{
            width: "100%",
            height: "100%",
            flex: 1,
            flexGrow: 1
          }}
          onContextMenu={(e) => e.stopPropagation()}
          ></textarea>
        </div>, 
        {width: 500, height:500})}/>
      {windows.map((window) => (
        !window.isMinimized ? (<Window
          key={window.id}
          id={window.id}
          title={window.title}
          content={window.content}
          position={window.position}
          setPosition={(newPosition) => updateWindowPosition(window.id, newPosition)}
          restorePosition={window.position}
          restoreSize={window.restoreSize}
          size={window.size}
          setSize={(newSize) => setWindowSize(window.id, newSize)}
          isActive={window.id === activeWindowId}
          isMaximized={window.isMaximized}
          doRestoreFromTaskbar={window.doRestoreFromTaskbar}
          closingWindowID={closingWindowID}
          setdoRestoreFromTaskbar={(val) => setdoRestoreFromTaskbar(window.id, val)}
          preClose={() => preCloseWindow(window.id)}
          preMaximize={() => preMaximizeWindow()}
          preRestore={() => preRestoreWindow(window.id)}
          getTaskbarTransformPos={() => getTaskbarTransformPos(window.id)}
          onClose={() => closeWindow(window.id)}
          onClick={() => activateWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onRestore={() => restoreWindow(window.id)} />)  : null
      ))}
      {contextMenu ? (
        <ContextMenu 
          contextMenuItems={contextMenu.items.map((item, index) => (
            {onClick: item.onClick, label: item.label}
          ))} 
          position={contextMenu.position}
          onClose={() => setAllInactive}
        />
      ) : null}
      <Launcher isVisible={isLauncherVisible} onClose={closeLauncher} />
      <Taskbar ref={taskbarRef} windows={windows} onSelectWindow={activateWindow} setButtonPosition={setButtonPosition} toggleLauncher={toggleLauncher}/>
    </div>
  );
}
export default App;