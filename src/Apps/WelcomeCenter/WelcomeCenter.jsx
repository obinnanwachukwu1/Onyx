import React, { useContext, useState, useEffect } from "react";
import { useWindowContext } from "../../Components/WindowContext";
import { DeviceContext } from "../../Components/DeviceContext";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import IconResume from '../../assets/icons/IconResume.svg';
import IconStore from '../../assets/icons/IconStore.svg';
import IconContact from '../../assets/icons/IconContact.svg';
import logo192 from '../../../public/logo192.png';
import './WelcomeCenter.css';

const WelcomeCenter = () => {
    const { launchApp } = useWindowContext();
    const { isMobile } = useContext(DeviceContext);
    const [loading, setLoading] = useState(true);
    const [workingStatus, setWorkingStatus] = useState("");

    useEffect(() => {
        fetch('https://obinnanwachukwu.com/projects/status.json', {cache: "no-cache"})
            .then(response => response.json())
            .then(data => {
                setWorkingStatus(data.working_status);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading working status:', error);
                setLoading(false);
            });
    }, []);


    return (
        <div className={`${isMobile ? 'welcome-container-mobile' : 'welcome-container'}`}>

            { loading ? (<LoadingScreen />) : (
            <div>
                <div className="welcome-header-section">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <img src={logo192} width={80} style={{filter: 'drop-shadow(0px 0px 5px rgba(34, 34, 34, 0.2))'}} />
                    <h1 className="welcome-header">The Onyx Environment</h1>
                    </div>
                    <p className="welcome-subheader">
                        Hi, I'm <strong>Obinna Nwachukwu</strong>, a Computer Science major at Georgia Tech. This is <strong>Onyx</strong> - an environment to showcase my projects and experience. Select an option below.
                    </p>
                </div>
            {
              !isMobile ? 
              <div className="welcome-action-section">
                <div className="welcome-card" onClick={() => launchApp("appcenter")}>
                    <img src={IconStore} className="welcome-card-icon" alt="Projects" />
                    <div className="welcome-card-text">
                        <h3>Projects</h3>
                        <p>My projects and collaborations</p>
                    </div>
                </div>
                <div className="welcome-card" onClick={() => launchApp("resume")}>
                    <img src={IconResume} className="welcome-card-icon" alt="Resume" />
                    <div className="welcome-card-text">
                        <h3>Resume</h3>
                        <p>My detailed education and experiences</p>
                    </div>
                </div>
                <div className="welcome-card" onClick={() => launchApp("contactme")}>
                    <img src={IconContact} className="welcome-card-icon" alt="Contact" />
                    <div className="welcome-card-text">
                        <h3>Contact</h3>
                        <p>Reach out to collaborate or connect</p>
                    </div>
                </div>
            </div>
            :
            <div className="welcome-action-section-mobile">
                <div className="welcome-card-mobile" onClick={() => launchApp("appcenter")}>
                    <img src={IconStore} className="welcome-card-icon-mobile" alt="Projects" />
                    <div className="welcome-card-text-mobile">
                        <h3>Projects</h3>
                        <p>My projects and collaborations</p>
                    </div>
                </div>
                <div className="welcome-card-mobile" onClick={() => launchApp("resume")}>
                    <img src={IconResume} className="welcome-card-icon-mobile" alt="Resume" />
                    <div className="welcome-card-text-mobile">
                        <h3>Resume</h3>
                        <p>My detailed education and experiences</p>
                    </div>
                </div>
                <div className="welcome-card-mobile" onClick={() => launchApp("contactme")}>
                    <img src={IconContact} className="welcome-card-icon-mobile" alt="Contact" />
                    <div className="welcome-card-text-mobile">
                        <h3>Contact</h3>
                        <p>Reach out to collaborate or connect!</p>
                    </div>
                </div>
            </div> 
            }
            

            <div className="welcome-current-focus">
                <h3 className="welcome-section-header">What I'm Working On</h3>
                <p className="welcome-focus-text">
                    {workingStatus}
                </p>
            </div>

            <footer className="welcome-footer">
                <p className="welcome-footer-text">
                    Attributions: Symbol icons from FontAwesome, stylized icons from KDE breeze-icons, crystal icon from SVGRepo, background from Unsplash
                </p>
                {isMobile ? (
                <p className="welcome-footer-text">
                    Need help? Click the crystal icon at the bottom of the screen to get started!
                </p>
                ) : (
                <p className="welcome-footer-text">
                    Need help? Click the crystal icon at the bottom left of the screen or drag and resize windows for a real desktop feel!
                </p>
            )}
            </footer>
            </div>
        )}
        </div>
    );
};

export default WelcomeCenter;