import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CarteVigneronsPro from "../components/CarteVigneronsPro"; // adapte le chemin si besoin
import ListeEvenements from "../components/ListeEvenements"; // adapte selon ton arbo
import Navpro from "./NavPro";
import "../style/css/EspacePro.css";
import video from "/src/pages/img/video.mp4";
import BurgerMenu from "../components/BurgerMenu"; // composant React
import Logo from "../pages/img/logowhite.png";
import Faq from "../components/faq";
import Doc from "../components/DochTech";
import Footer from "../pages/Footer";
import Separator from "../pages/img/Separator.png";

import supabase from "../../src/supaBaseClient";

export default function EspacePro() {
  const navigate = useNavigate();
  const [checkResult, setCheckResult] = useState("⏳ Vérification en cours...");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setCheckResult("⛔ Aucun utilisateur connecté.");
        return;
      }

      const uid = user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, email, username")
        .eq("id", uid)
        .single();

      if (profileError || !profile) {
        setCheckResult(
          `⛔ Pas de profil trouvé pour l'utilisateur avec l'uid : ${uid}`
        );
        return;
      }

      if (profile.role === "admin") {
        setCheckResult(
          `✅ Utilisateur admin détecté : ${profile.username} (${profile.email})`
        );
      } else {
        setCheckResult(
          `⚠️ Utilisateur connecté, mais role = '${profile.role}'`
        );
      }
    };

    checkAdmin();
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
          <Navpro />
        </div>
        <video autoPlay muted loop playsInline className="hero-video__media">
          <source src={video} type="video/mp4" />
          Votre navigateur ne supporte pas les vidéos HTML5.
        </video>
        <div className="hero-content-pro">
          <a href="#fond1-section" className="hero-btn">
            Explorer
          </a>
          <div className="scroll-circle">
            <span className="arrow-down"></span>
          </div>
        </div>
      </section>

      {/* Espace admin / pro */}
      <div className="wrapper-pro" id="actu">
        <section
          id="fond1-section-pro"
          className="bg-white p-6 md:p-12 fond1-section-pro"
        >
          <div className="gauche-pro">
            <h1>CEPS & CHARRUES</h1>
            <h2>Bienvenue sur votre Espace Professionel</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam.
            </p>
          </div>
        </section>
      </div>
      <img src={Separator} alt="Logo" className="separator" id="map" />
      <section className="fond2-section-pro">
        <h1 className="carte-pro">Votre Carte Intéractive Professionel</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam.
        </p>
        <CarteVigneronsPro />
      </section>
      <img src={Separator} alt="Logo" className="separator" id="event" />
      <section className="fond3-section-pro">
        <ListeEvenements />
      </section>
      <img src={Separator} alt="Logo" className="separator" id="faq" />
      <section className="fond4-section-pro">
        <Faq />
      </section>
      <img src={Separator} alt="Logo" className="separator" id="docs" />
      <Doc />
      <Footer />
    </div>
  );
}
