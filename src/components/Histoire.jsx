import React from "react";
import Footer from "../pages/Footer";
import Navpc from "../pages/NavHistoire";
import "../style/scss/Histoire.scss";
import BurgerMenu from "../components/BurgerMenu";
import Logo from "../pages/img/logowhite.png";
import "../style/scss/BurgerMenu.scss";
import video from "../pages/img/video.mp4";
import tempoimg from "../pages/img/tempoimg.jpeg"; // Assurez-vous que le chemin est correct
import "../style/css/style.css"; // Assurez-vous que le chemin est correct

const Histoire = () => {
  return (
    <>
      <section className="hero-video">
        <div className="hero-navbar">
          <img src={Logo} alt="Logo" className="hero-logo" />
          <BurgerMenu />
        </div>

        <div className="navpc">
          <Navpc />
        </div>

        <video autoPlay muted loop playsInline className="hero-video__media">
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

      <div className="histoire-container">
        <main className="histoire-content">
          <section className="histoire-section">
            <h2>CEPS & CHARRUES</h2>
            <h1 className="histoire-title">L'Histoire de Ceps & Charrues</h1>
            <img src={tempoimg}></img>
            <p className="histoire-text">
              Située dans le magnifique terroir du Beaujolais, l'association
              Ceps & Charrues a vu le jour pour promouvoir les pratiques
              agricoles respectueuses de l'environnement et valoriser les
              produits locaux. Fondée en 1969, elle regroupe des passionnés de
              la vigne et de l'agriculture durable, unissant leurs efforts pour
              préserver le patrimoine naturel et culturel de la région.
            </p>
            <p className="histoire-text">
              Depuis ses débuts, l'association a organisé de nombreux
              événements, ateliers et formations pour sensibiliser le public et
              les professionnels aux enjeux de l'agriculture biologique. Grâce à
              l'engagement de ses membres, Ceps & Charrues est devenue une
              référence dans le domaine, inspirant d'autres régions à suivre son
              exemple.
            </p>
            <p className="histoire-text">
              Depuis ses débuts, l'association a organisé de nombreux
              événements, ateliers et formations pour sensibiliser le public et
              les professionnels aux enjeux de l'agriculture biologique. Grâce à
              l'engagement de ses membres, Ceps & Charrues est devenue une
              référence dans le domaine, inspirant d'autres régions à suivre son
              exemple.
            </p>
            <p className="histoire-text">
              Depuis ses débuts, l'association a organisé de nombreux
              événements, ateliers et formations pour sensibiliser le public et
              les professionnels aux enjeux de l'agriculture biologique. Grâce à
              l'engagement de ses membres, Ceps & Charrues est devenue une
              référence dans le domaine, inspirant d'autres régions à suivre son
              exemple.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};
export default Histoire;
