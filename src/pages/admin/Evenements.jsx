import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Evenements() {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          "https://render-pfyp.onrender.com/api/evenements"
        );
        const data = await res.json();
        setEvenements(data);
      } catch (err) {
        console.error("Erreur de chargement des événements :", err);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet événement ?")) return;

    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/evenements/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (result.success) {
        setEvenements((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (err) {
      console.error("Erreur suppression événement :", err);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3>📃 Liste des événements</h3>
        <button onClick={() => navigate("/admin/evenements/add")}>
          ➕ Ajouter
        </button>
      </div>

      {evenements.length === 0 ? (
        <p>Aucun événement pour le moment.</p>
      ) : (
        <ul>
          {evenements.map((e) => (
            <li key={e.id}>
              <strong>{e.titre}</strong> à {e.lieu} – {e.date_evenement} (
              {e.type})<p>{e.description}</p>
              {e.lien && (
                <a
                  href={e.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginBottom: "5px" }}
                >
                  🔗 En savoir plus
                </a>
              )}
              <div style={{ marginTop: "5px" }}>
                <button
                  onClick={() => navigate(`/admin/evenements/edit/${e.id}`)}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  style={{ marginLeft: "10px" }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
