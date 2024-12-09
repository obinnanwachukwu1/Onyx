import React from 'react';
import "./Resume.css"
import resumePDF from "../../assets/content/resume.pdf"

const Resume = () => {
    return (
        <div className="resume">
            <object data={`${resumePDF}#zoom=100`} type="application/pdf" width="100%" height="100%"></object>
        </div>
    );
};

export default Resume;