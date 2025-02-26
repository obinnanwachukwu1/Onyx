import React from 'react';
import "./Resume.css"

const Resume = () => {
    return (
        <div className="resume">
            <object data="/resume.pdf" type="application/pdf" width="100%" height="100%"></object>
        </div>
    );
};

export default Resume;