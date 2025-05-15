// components/admin/EditDocument.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    date_publication: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(
          `https://render-pfyp.onrender.com/api/documents/${id}`
        );
        const data = await res.json();
        if (data) {
          setFormData({
            titre: data.titre,
            description: data.description,
            date_publication: data.date_publication?.split("T")[0],
          });
        }
      } catch (err) {
        console.error("❌ Erreur chargement document :", err);
        setMessage("❌ Erreur lors du chargement du document");
      }
    };

    fetchDocument();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/documents/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();
      if (result.success) {
        setMessage("✅ Document mis à jour !");
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setMessage("❌ " + result.error);
      }
    } catch (err) {
      console.error("❌ Erreur mise à jour :", err);
      setMessage("❌ Une erreur s'est produite.");
    }
  };

  return (
    <div>
      <h2>✏️ Modifier un document</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <input
          type="text"
          placeholder="Titre"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          style={{ marginTop: "10px" }}
        />

        <input
          type="date"
          value={formData.date_publication}
          onChange={(e) =>
            setFormData({ ...formData, date_publication: e.target.value })
          }
          style={{ marginTop: "10px" }}
          required
        />

        <button type="submit" style={{ marginTop: "15px" }}>
          💾 Enregistrer
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.startsWith("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
