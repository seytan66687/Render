import React, { useState, useEffect } from "react";
import "../style/scss/BurgerMenu.scss";

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.width = "100%";
    } else {
      body.style.overflow = "";
      body.style.position = "";
      body.style.width = "";
    }

    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <>
      <button
        className={`burger-toggle ${isOpen ? "open black" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`burger-overlay white ${isOpen ? "visible" : ""}`}>
        <nav className="burger-panel left">
          <ul className="burger-links">
            <li>
              <a href="/">Notre Histoire</a>
            </li>
            <li>
              <a href="/decouvrir">Notre Carte</a>
            </li>
            <li>
              <a href="/visiter">Evenements & Formations</a>
            </li>
            <li>
              <a href="/blog">Nos Partenaires</a>
            </li>
            <li>
              <a href="/login" className="btn-acces">
                Espace Pro
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default BurgerMenu;
