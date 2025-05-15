import React, { useEffect, useState } from "react";
import "../style/scss/navbar.scss";
import "../style/css/navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".hero-video");
    const heroHeight = hero?.offsetHeight || 0;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navpc ${isScrolled ? "scrolled" : ""}`}>
      <div className="total-flex">
        <div className="nav-links-histoire">
          <a href="./">Accueil</a>
          <a href="#map">Notre Carte</a>
          <a href="#actu">Fil D’actualitées</a>
        </div>

        <div className="navbar-logo-histoire">
          <img
            src={
              isScrolled
                ? "../../src/pages/img/logo.png"
                : "../../src/pages/img/logowhite.png"
            }
            alt="Logo"
          />
        </div>

        <div className="nav-links">
          <a href="#">Adhésions</a>
          <a href="#partner">Partenaires</a>
          <a href="/login" className="pro">
            Espace Pro
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
