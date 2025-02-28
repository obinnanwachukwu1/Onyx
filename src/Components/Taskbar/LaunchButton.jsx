import React from 'react';
import './LaunchButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import IconCrystal from '../../assets/icons/IconCrystal.svg';
const LaunchButton = ({ onClick, launcherVisible }) => {
    return (
        <button className={`launch-button ${launcherVisible ? "clicked" : ""}`} onClick={onClick}>
            <img src={IconCrystal}/>
        </button>
    );
};

export default LaunchButton;