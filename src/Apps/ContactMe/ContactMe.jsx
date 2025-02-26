import React, { useState } from "react";
import "./ContactMe.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

const ContactMe = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send the form data to your email server or API
    console.log("Message sent:", formData);

    // Reset the form and show success feedback (optional)
    setFormData({ name: "", email: "", message: "" });
    alert("Your message has been sent!");
    setShowForm(false);
  };

  return (
    <div className="contact-me">
      {!showForm ? (
        <div className="contact-options">
          <h2>Contact Me</h2>
            <div
                key={"linkedin"}
                className="contact-item"
                onClick={() => window.open("https://www.linkedin.com/in/obinnanwachukwugt")}
            >
                <div className="contact-icon"><FontAwesomeIcon icon={faLinkedin} /></div>
                <div className="contact-info">
                <h3>LinkedIn</h3>
                <p>obinnanwachukwugt</p>
                </div>
            </div>
            <div
                key={"instagram"}
                className="contact-item"
                onClick={() => window.open("https://www.instagram.com/itsobinnasworld")}
            >
                <div className="contact-icon"><FontAwesomeIcon icon={faInstagram} /></div>
                <div className="contact-info">
                <h3>Instagram</h3>
                <p>itsobinnasworld</p>
                </div>
            </div>
            <div
                key={"github"}
                className="contact-item"
                onClick={() => window.open("https://www.github.com/chemicaldaniel")}
            >
                <div className="contact-icon"><FontAwesomeIcon icon={faGithub} /></div>
                <div className="contact-info">
                <h3>Github</h3>
                <p>ChemicalDaniel</p>
                </div>
            </div>
            <div
                key={"email"}
                className="contact-item"
                onClick={() => window.open("mailto:obinna.nwachukwu@icloud.com")}
            >
                <div className="contact-icon"><FontAwesomeIcon icon={faEnvelope} /></div>
                <div className="contact-info">
                <h3>Email</h3>
                <p>obinna.nwachukwu@icloud.com</p>
                </div>
            </div>
          <button className="direct-contact-button" onClick={() => setShowForm(true)}>
            Contact Me Directly
          </button>
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
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
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