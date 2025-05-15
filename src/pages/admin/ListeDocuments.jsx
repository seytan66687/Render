import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ListeDocuments() {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          "https://render-pfyp.onrender.com/api/documents"
        );
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("❌ Erreur chargement documents :", err);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;

    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );
      const result = await res.json();

      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setMessage("✅ Document supprimé.");
      } else {
        setMessage("❌ Erreur : " + result.error);
      }
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
      setMessage("❌ Une erreur s'est produite.");
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
        <h2>📄 Liste des documents techniques</h2>
        <button onClick={() => navigate("/admin/documents/add")}>
          ➕ Ajouter
        </button>
      </div>

      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}

      {documents.length === 0 ? (
        <p>Aucun document pour le moment.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {documents.map((doc) => (
            <li
              key={doc.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px",
                marginBottom: "15px",
              }}
            >
              <h3>{doc.titre}</h3>
              <p>
                <strong>Description :</strong> {doc.description}
              </p>
              <p>
                <strong>Date :</strong> {doc.date_publication}
              </p>

              <p>
                <strong>Fichier :</strong>{" "}
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  📎 Voir le fichier
                </a>
              </p>
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => navigate(`/admin/documents/edit/${doc.id}`)}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
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
