import '../component-styles/Footer.css';
import logo from '../images/logo.svg'; 
import linkedinLogo from '../images/linkedin-logo.svg'; 

/**
 * Footer Component
 * 
 * Renders the application footer containing branding and creator information.
 * Features:
 * - App logo display
 * - Creator attribution
 * - LinkedIn profile link with logo
 * 
 * @returns {JSX.Element} Footer with logo, creator info, and social link
 */
function Footer() {
  return (
    <footer className="footer-container">
      <img src={logo} alt="Logo" className="footer-logo" />
      <div className="footer-right">
        <a href="https://www.linkedin.com/in/joaquinbustos633/" target="_blank" rel="noopener noreferrer">
          <img src={linkedinLogo} alt="LinkedIn Logo" className="footer-linkedin-logo" />
        </a>
        <span className="footer-name"> Created by <br />Joaquin Bustos</span>
      </div>
    </footer>
  );
}

export default Footer;
