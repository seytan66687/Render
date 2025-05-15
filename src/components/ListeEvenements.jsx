import { useEffect, useState } from "react";

export default function ListeEvenements() {
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          "https://render-pfyp.onrender.com/api/evenements"
        );
        const data = await res.json();
        setEvenements(data);
      } catch (err) {
        console.error("Erreur chargement des événements :", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="event-container">
      <h1>CEPS & CHARRUES</h1>
      <h3 className="titre-event-pro">Liste des événements</h3>
      {evenements.length === 0 ? (
        <p>Aucun événement pour le moment.</p>
      ) : (
        <ul>
          {evenements.map((e) => (
            <li key={e.id} className="evenement-wrapper">
              <span className="title-event">Evénement: {e.titre}</span>

              <div className="evenement-container">
                <span className="evenement-tag">
                  Type : {e.type || "Non spécifié"}
                </span>
                <span className="desc">{e.description}</span>
                <span className="evenement-tag">Date : {e.date_evenement}</span>
              </div>

              {e.lien && (
                <a
                  href={e.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evenement-link"
                >
                  → En savoir plus
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
