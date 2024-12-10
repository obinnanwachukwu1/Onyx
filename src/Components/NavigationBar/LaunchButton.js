import React from 'react';
import './LaunchButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

const LaunchButton = ({ onClick }) => {
    return (
        <button className={`launch-button-mobile`} onClick={onClick}>
            <FontAwesomeIcon icon={faRocket}/>
        </button>
    );
};

export default LaunchButton;