import FaFacebookF from "../pages/img/réseaux/facebook.png";
import FaInstagram from "../pages/img/réseaux/insta.png";
import FaXTwitter from "../pages/img/réseaux/X.png";

import logo from "../pages/img/logoceps2.png";
import "../style/scss/Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-section">
        <img src={logo} alt="Logo CEPS" className="footer-logo" />
      </div>

      <div className="footer-section">
        <h3>Contact</h3>
        <p>+33 0606060606</p>
        <p>email@email.fr</p>
      </div>

      <div className="footer-section">
        <h3>Liens</h3>
        <p>Accueil</p>
        <p>Notre Histoire</p>
        <p>Mentions Légales</p>
      </div>

      <div className="footer-section">
        <h3>Nos Réseaux</h3>
        <div className="footer-socials">
          <a href="#">
            <img src={FaFacebookF} alt="Facebook" />
          </a>
          <a href="#">
            <img src={FaInstagram} alt="Instagram" />
          </a>
          <a href="#">
            <img src={FaXTwitter} alt="Twitter / X" />
          </a>
        </div>
      </div>
    </footer>
  );
}
