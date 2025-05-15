import React, { useEffect, useState } from "react";
import "../style/scss/navbar.scss";
import "../style/css/navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".hero-video");
    const heroHeight = hero?.offsetHeight || 0;

    const handleScroll = () => {
      // Marge de 10px pour anticiper la transition
      setIsScrolled(window.scrollY > heroHeight - 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navpc ${isScrolled ? "scrolled" : ""}`}>
      <div className="total-flex">
        <div className="nav-links">
          <a href="#story">Notre Histoire</a>
          <a href="#map">Notre Carte</a>
          <a href="#actu">Fil D’actualités</a>
        </div>

        <div className="navbar-logo">
          <img
            src={isScrolled ? "./img/logo.png" : "./img/logowhite.png"}
            alt="Logo"
          />
        </div>

        <div className="nav-links">
          <a href="https://www.helloasso.com/associations/ceps-et-charrues-beaujolais/adhesions/bulletin-d-adhesion-ceps-et-charrues-2025">
            Adhésions
          </a>
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
