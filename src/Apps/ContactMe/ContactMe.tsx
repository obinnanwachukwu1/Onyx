import { useState } from 'react';
import './ContactMe.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactMe = (): JSX.Element => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Message sent:', formData);
    setFormData({ name: '', email: '', message: '' });
    alert('Your message has been sent!');
    setShowForm(false);
  };

  return (
    <div className="contact-me">
      {!showForm ? (
        <div className="contact-options">
          <h2>Contact Me</h2>
          <div className="contact-item" onClick={() => window.open('https://www.linkedin.com/in/obinnanwachukwugt')}>
            <div className="contact-icon">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
            <div className="contact-info">
              <h3>LinkedIn</h3>
              <p>obinnanwachukwugt</p>
            </div>
          </div>
          <div className="contact-item" onClick={() => window.open('https://www.github.com/obinnanwachukwu1')}>
            <div className="contact-icon">
              <FontAwesomeIcon icon={faGithub} />
            </div>
            <div className="contact-info">
              <h3>Github</h3>
              <p>obinnanwachukwu1</p>
            </div>
          </div>
          <div className="contact-item" onClick={() => window.open('mailto:me@obinnanwachukwu.com')}>
            <div className="contact-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div className="contact-info">
              <h3>Email</h3>
              <p>me@obinnanwachukwu.com</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="contact-form">
          <button className="back-button" onClick={() => setShowForm(false)}>
            ← Back
          </button>
          <h2>Send Me a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="send-button">
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContactMe;
