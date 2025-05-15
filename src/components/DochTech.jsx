import React from "react";
import "../style/scss/DocTech.scss";
import {
  FaExternalLinkAlt,
  FaGlobe,
  FaLeaf,
  FaFileAlt,
  FaCog,
  FaBook,
} from "react-icons/fa";
import arrowIcon from "../pages/img/svg/arrow.svg";

const documents = [
  {
    icon: <FaFileAlt />,
    title: "Documents De Formations",
    description: "Support et Formations en agriculture Biologique.",
  },
  {
    icon: <FaGlobe />,
    title: "Sites Informatifs Bios",
    description: "Sites informatifs externes Biologiques.",
  },
  {
    icon: <FaGlobe />,
    title: "Sites externes",
    description:
      "Ressources en ligne et liens externes sur l’agriculture Biologique.",
  },
  {
    icon: <FaCog />,
    title: "Guide Vigneron",
    description:
      "Manuel Technique sur les différentes pratiques viticoles Biologique.",
  },
  {
    icon: <FaLeaf />,
    title: "Documentation sur l’agriculture biologique.",
    description:
      "Informations sur les méthodes et les réglementations Biologiques.",
  },
  {
    icon: <FaBook />,
    title: "Documents ateliers paysans",
    description:
      "Documents sur les différents ateliers de paysans Biologiques.",
  },
];

const DocumentsTechniques = () => {
  return (
    <div className="documents-techniques">
      <h2>Documents Techniques</h2>
      <ul>
        {documents.map((doc, index) => (
          <li key={index} className="doc-item">
            <div className="icon">{doc.icon}</div>
            <div className="text">
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
            </div>
            <div className="arrow1">
              <img src={arrowIcon} alt="Arrow" className="arrow2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentsTechniques;
