import React, { useState } from "react";
import * as XLSX from "xlsx";

const ImportExcel = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("Aucun fichier sélectionné.");

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) return alert("Le fichier est vide.");

      const headerKeys = Object.keys(rows[0]);
      const columnMap = {
        email: null,
        username: null,
        password: null,
        role: null,
      };

      for (const key of headerKeys) {
        const keyLower = key.toLowerCase();
        if (!columnMap.email && keyLower.includes("email"))
          columnMap.email = key;
        if (
          !columnMap.username &&
          (keyLower.includes("prénom") ||
            keyLower.includes("prenom") ||
            keyLower.includes("username"))
        )
          columnMap.username = key;
        if (
          !columnMap.password &&
          ((keyLower.includes("mot") && keyLower.includes("passe")) ||
            keyLower.includes("password"))
        )
          columnMap.password = key;
        if (!columnMap.role && keyLower.includes("role")) columnMap.role = key;
      }

      const allUsers = [];
      const vigneronEmails = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const email = (row[columnMap.email] || "").toString().trim();
        const username = (row[columnMap.username] || "").toString().trim();
        const password = (row[columnMap.password] || "").toString().trim();
        const role = (row[columnMap.role] || "").toString().trim();

        if (!email || !username || !password || !role) {
          console.warn(`⚠️ Ligne ${i + 1} ignorée : champ manquant`);
          continue;
        }

        allUsers.push({ email, username, password, role });
        if (role.toLowerCase() === "vigneron") vigneronEmails.push(email);
      }

      if (allUsers.length === 0)
        return alert("Aucun utilisateur valide à importer.");

      setIsLoading(true);

      try {
        const res = await fetch(
          "https://render-pfyp.onrender.com/api/import-users",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              users: allUsers,
              emailsToKeep: vigneronEmails,
            }),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          console.error("❌ Erreur import groupé :", result.error);
          alert("Une erreur est survenue pendant l'import.");
        } else {
          console.log("✅ Import réussi :", result);
          alert("✅ Tous les utilisateurs ont été importés !");
        }
      } catch (err) {
        console.error("❌ Erreur réseau :", err.message);
        alert("Erreur réseau lors de l'import.");
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto mt-10 text-center">
      <h2 className="text-lg font-bold mb-4">
        Importer tous les utilisateurs (.xlsx)
      </h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {isLoading && (
        <p className="text-blue-600 animate-pulse">⏳ Import en cours...</p>
      )}
    </div>
  );
};

export default ImportExcel;
