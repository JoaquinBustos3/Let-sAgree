import '../component-styles/Footer.css';
import logo from '../images/logo.svg'; // Replace with the actual logo file
import linkedinLogo from '../images/linkedin-logo.svg'; // Replace with the actual LinkedIn logo file

function Footer() {
  return (
    <footer className="footer-container">
      <img src={logo} alt="Logo" className="footer-logo" />
      <div className="footer-right">
        <a href="https://www.linkedin.com/in/joaquinbustos633/" target="_blank" rel="noopener noreferrer">
          <img src={linkedinLogo} alt="LinkedIn Logo" className="footer-linkedin-logo" />
        </a>
        <span className="name"> Created by Joaquin Bustos</span>
      </div>
    </footer>
  );
}

export default Footer;
