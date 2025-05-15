import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import supabase from "../supaBaseClient";
import CarteVignerons from "../components/CarteVignerons";
import "../style/scss/Accueil.scss";
import "../style/css/style.css";
import video from "/src/pages/img/video.mp4";
import BurgerMenu from "../components/BurgerMenu"; // composant React
import "../style/scss/BurgerMenu.scss"; // styles SCSS appliqués globalement
import Footer from "./Footer";
import Navpc from "./Navpc";
import AnimatedContent from "../components/AnimatedContent";

import Logo from "../pages/img/logowhite.png";
import bouteille from "../pages/img/bouteille_ceps.png";
import logo1 from "../pages/img/agribio.png";
import logo2 from "../pages/img/circuitscourt.png";
import logo3 from "../pages/img/respect.png";
import logo4 from "../pages/img/emballage.png";

import part1 from "../pages/img/partenaire/belair.png";
import part2 from "../pages/img/partenaire/celesta.png";
import part3 from "../pages/img/partenaire/verde.png";
import part4 from "../pages/img/partenaire/gest.png";

import Separator from "../pages/img/Separator.png";

export default function Accueil() {
  const [actus, setActus] = useState([]);

  useEffect(() => {
    const fetchActus = async () => {
      const { data, error } = await supabase
        .from("fil_actualite")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération actualités :", error);
      } else {
        setActus(data);
      }
    };

    fetchActus();
  }, []);

  return (
    <div className="font-sans text-gray-800">
      {/* Section d'intro */}
      <section className="hero-video">
        <div className="hero-navbar">
          <img src={Logo} alt="Logo" className="hero-logo" />
          <BurgerMenu />
        </div>
        <div className="navpc">
          <Navpc />
        </div>
        <video
          rel="preload"
          autoPlay
          muted
          loop
          playsInline
          className="hero-video__media"
        >
          <source src={video} type="video/mp4" />
          Votre navigateur ne supporte pas les vidéos HTML5.
        </video>
        <div className="hero-content">
          <a href="#fond1-section" className="hero-btn">
            Découvrir
          </a>
          <div className="scroll-circle">
            <span className="arrow-down"></span>
          </div>
        </div>
      </section>

      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        config={{ tension: 50, friction: 25 }}
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.1}
      >
        <div className="wrapper" id="actu">
          <section
            id="fond1-section"
            className="bg-white p-6 md:p-12 fond1-section"
          >
            <div className="gauche">
              <h1>CEPS & CHARRUES</h1>
              <h2>Evénements & Formations</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam.
              </p>
              <a href="/actualites" className="btn-actus">
                → voir toutes les actualités
              </a>
            </div>
            <div className="actualites-grid">
              {actus.map((item) => (
                <div key={item.id} className="actualite-card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.titre}
                      className="actualite-image"
                    />
                  )}
                  <h3>{item.titre}</h3>
                  <p>
                    {item.contenu.length > 150
                      ? item.contenu.slice(0, 150) + "..."
                      : item.description}
                  </p>
                  <small>
                    Publié le {new Date(item.created_at).toLocaleDateString()}
                  </small>
                  <Link to={`/article/${item.id}`}>→ En savoir plus</Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AnimatedContent>
      <img src={Separator} alt="Logo" className="separator" id="story" />
      {/* Notre Histoire */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        config={{ tension: 50, friction: 25 }}
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.1}
      >
        <section className="fond2-section">
          <div className="text-zone">
            <h1>CEPS & CHARRUES</h1>
            <h2>Notre Histoire</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam.
            </p>
            <a href="/histoire" className="cta">
              En Savoir Plus
            </a>
          </div>

          <img src={bouteille} alt="Bouteille de vin" className="bouteille" />

          <div className="logos">
            <div className="logo1">
              <img src={logo1} alt="Logo" className="img-1" />
              <h3>Agriculture Biologique</h3>
            </div>
            <div className="logo1">
              <img src={logo3} alt="Logo" className="img-1" />
              <h3>Respect du Terroir</h3>
            </div>
            <div className="logo1">
              <img src={logo4} alt="Logo" className="img-1" />
              <h3>Emballages Responsables</h3>
            </div>
            <div className="logo1">
              <img src={logo2} alt="Logo" className="img-1" />
              <h3>Circuits Courts</h3>
            </div>
          </div>
        </section>
      </AnimatedContent>
      {/* fin des citations "respect du terroir etc*/}
      <img src={Separator} alt="Logo" className="separator" id="map" />
      {/* Carte */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        config={{ tension: 50, friction: 25 }}
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.1}
      >
        <section className="bg-orange-100 p-6 md:p-12 text-center fond3-section">
          <h1>CEPS & CHARRUES</h1>
          <h2 className="text-2xl font-semibold mb-4">
            Nos domaines viticoles
          </h2>
          <div className="max-w-4xl mx-auto mt-6">
            <CarteVignerons />
          </div>
        </section>
      </AnimatedContent>
      <img src={Separator} alt="Logo" className="separator" id="partner" />
      {/* Partenaires */}
      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse={false}
        config={{ tension: 50, friction: 25 }}
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.1}
      >
        <section className="bg-red-100 p-6 md:p-12 text-center fond4-section">
          <h1>CEPS & CHARRUES</h1>
          <h2 className="text-2xl font-semibold mb-4 ">Nos Partenaires</h2>
          <p className="max-w-xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam.
          </p>
          <div className="grid-partenaires">
            <div className="part1">
              <a
                href="https://lycee-belair.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={part1} alt="Logo" className="logo-partenaire" />
              </a>
            </div>
            <div className="part2">
              <a
                href="https://celesta-lab.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={part2} alt="Logo" className="logo-partenaire" />
              </a>
            </div>
            <div className="part3">
              <a
                href="https://www.verdeterreprod.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={part3} alt="Logo" className="logo-partenaire" />
              </a>
            </div>
            <div className="part4">
              <a
                href="https://asso-gest.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={part4} alt="Logo" className="logo-partenaire" />
              </a>
            </div>
          </div>
        </section>
      </AnimatedContent>
      <Footer />
    </div>
  );
}
