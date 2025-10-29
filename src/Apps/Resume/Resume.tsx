import './Resume.css';

const Resume = (): JSX.Element => {
  return (
    <div className="resume">
      <object data="/resume.pdf" type="application/pdf" width="100%" height="100%" />
    </div>
  );
};

export default Resume;
