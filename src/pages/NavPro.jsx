import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "/src/supaBaseClient.js"; // ✅
// adapte le chemin si besoin

import "../style/scss/navbar.scss";
import "../style/css/navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hero = document.querySelector(".hero-video");
    const heroHeight = hero?.offsetHeight || 0;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className={`navpc ${isScrolled ? "scrolled" : ""}`}>
      <div className="total-flex">
        <div className="nav-links move">
          <a href="/">Accueil</a>
          <a href="#map">La Carte Pro</a>
          <a href="#event">Les Événements</a>
        </div>

        <div className="navbar-logo move-pro">
          <img
            src={isScrolled ? "./img/logo.png" : "./img/logowhite.png"}
            alt="Logo"
          />
        </div>

        <div className="nav-links move">
          <a href="#faq">La F.A.Q</a>
          <a href="#docs">Les Documents</a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="pro"
          >
            Se déconnecter
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
