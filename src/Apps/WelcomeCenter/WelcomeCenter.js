import React, {useContext} from "react";
import { WindowManagerContext } from "../../Components/WindowManagerContext";

const WelcomeCenter = () => {

    const {launchApp} = useContext(WindowManagerContext)
    return (
        <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.headerSection}>
            <h1 style={styles.header}>Welcome to My Portfolio</h1>
            <p style={styles.subheader}>
            Hi, I'm <strong>Obinna Nwachukwu</strong>, a Computer Science major at Georgia Tech. Explore my projects, skills, and journey below!
            </p>
        </div>

        {/* Action Section */}
        <div style={styles.actionSection}>
            <div style={styles.card} onClick={() => launchApp("appcenter")}>
            <div style={styles.cardIcon}>📁</div>
            <div style={styles.cardText}>
                <h3>Projects</h3>
                <p>See my best work and technical accomplishments.</p>
            </div>
            </div>
            <div style={styles.card} onClick={() => launchApp("resume")}>
            <div style={styles.cardIcon}>📄</div>
            <div style={styles.cardText}>
                <h3>Resume</h3>
                <p>View my experience and skills in detail.</p>
            </div>
            </div>
            <div style={styles.card} onClick={() => alert("Opening Contact...")}>
            <div style={styles.cardIcon}>✉</div>
            <div style={styles.cardText}>
                <h3>Contact</h3>
                <p>Reach out to collaborate or connect!</p>
            </div>
            </div>
        </div>

        {/* Current Focus Section */}
        <div style={styles.currentFocus}>
            <h3 style={styles.sectionHeader}>What I’m Working On</h3>
            <p style={styles.focusText}>
            I’m building an AI-driven collaborative documentation assistant for the Berkeley RDI Hackathon.
            </p>
        </div>

        {/* Footer Section */}
        <footer style={styles.footer}>
            <p style={styles.footerText}>
            Need help? Use the taskbar below or drag and resize windows for a real desktop feel!
            </p>
        </footer>
        </div>
    );
};

const styles = {
  container: {
    width: "85%",
    maxWidth: "650px",
    margin: "30px auto",
    padding: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Roboto', sans-serif",
    color: "#333",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "20px",
  },
  header: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#0078D7",
    marginBottom: "10px",
  },
  subheader: {
    fontSize: "16px",
    color: "#555",
    lineHeight: "1.5",
  },
  actionSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "30px",
    marginBottom: "40px",
  },
  card: {
    flex: "1",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#F5F8FA",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #E0E6ED",
  },
  cardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
    backgroundColor: "#E8F0FE",
  },
  cardIcon: {
    fontSize: "32px",
    marginBottom: "10px",
    color: "#0078D7",
  },
  cardText: {
    fontSize: "14px",
    color: "#555",
  },
  currentFocus: {
    textAlign: "center",
    marginTop: "20px",
  },
  sectionHeader: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#444",
  },
  focusText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    borderTop: "1px solid #EEE",
    paddingTop: "10px",
  },
  footerText: {
    fontSize: "13px",
    color: "#777",
  },
};

export default WelcomeCenter;