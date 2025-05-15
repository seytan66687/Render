import React, { useState } from "react";
import "../style/scss/faq.scss"; // ou .scss selon ton projet

const questions = [
  "Qu’est ce qu’un vin bio ?",
  "Comment devenir membre de l’association ?",
  "Où acheter vos vins ?",
  "Organisez-vous des évènements ?",
  "Peut-on visiter les domaines ?",
  "Comment garantir la qualité de vos vins bio ?",
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Foire Aux Questions</h2>
      <ul className="faq-list">
        {questions.map((q, index) => (
          <li key={index} className="faq-item" onClick={() => toggle(index)}>
            <div className="faq-question">
              <span>
                {index + 1}. {q}
              </span>
              <span
                className={`arrow ${openIndex === index ? "open" : ""}`}
              ></span>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>Réponse à venir...</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
