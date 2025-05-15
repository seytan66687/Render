import { useState } from "react";

export default function ImportDomaines() {
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://render-pfyp.onrender.com/api/import-domaines",
        {
          method: "POST",
          body: formData,
        }
      );

      const raw = await res.text();
      let result = {};

      try {
        result = JSON.parse(raw);
      } catch (jsonErr) {
        throw new Error("Réponse serveur invalide: " + raw);
      }

      if (!res.ok || result.error) {
        setMessage("❌ Erreur : " + (result.error || "Erreur inconnue."));
      } else {
        setMessage(`✅ ${result.imported} domaines importés avec succès !`);
      }
    } catch (err) {
      console.error("❌ Erreur réseau ou serveur :", err.message);
      setMessage("❌ Erreur réseau ou serveur");
    }
  };

  return (
    <div style={{ marginBottom: "40px" }}>
      <h3>📤 Importer des domaines viticoles (Excel)</h3>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleUpload}
        style={{ marginBottom: "10px" }}
      />
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
