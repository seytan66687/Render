import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `https://render-pfyp.onrender.com/api/evenements/${id}`
        );
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("❌ Erreur de chargement :", err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://render-pfyp.onrender.com/api/evenements/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();
      if (result.success) {
        setMessage("✅ Événement mis à jour !");
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setMessage("❌ " + result.error);
      }
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      setMessage("❌ Une erreur est survenue.");
    }
  };

  if (!formData) return <p>Chargement...</p>;

  return (
    <div>
      <h2>📝 Modifier un événement</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          required
        />
        <input
          type="text"
          value={formData.lieu}
          onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
          required
        />
        <input
          type="date"
          value={formData.date_evenement}
          onChange={(e) =>
            setFormData({ ...formData, date_evenement: e.target.value })
          }
          required
        />
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
        >
          <option value="">-- Type d'événement --</option>
          <option value="Viticole">Viticole</option>
          <option value="Bio">Bio</option>
          <option value="Dégustation">Dégustation</option>
          <option value="Formation">Formation</option>
        </select>
        <button type="submit">💾 Sauvegarder</button>
      </form>

      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
