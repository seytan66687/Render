import { useEffect, useState } from "react";

export default function DocumentsTechniques() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(
          "https://render-pfyp.onrender.com/api/documents"
        );
        const rawText = await res.text();

        if (!res.ok) throw new Error(`Erreur ${res.status} : ${rawText}`);

        const data = JSON.parse(rawText);
        setDocuments(data);
      } catch (error) {
        console.error("Erreur fetch documents :", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📄 Documents Techniques</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border border-gray-300 table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Titre</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Date de publication</th>
              <th className="border p-2">Créé le</th>
              <th className="border p-2">Fichier</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="border p-2">{doc.titre}</td>
                <td className="border p-2">{doc.description}</td>
                <td className="border p-2">{doc.date_publication}</td>
                <td className="border p-2">
                  {doc.created_at
                    ? new Date(doc.created_at).toLocaleString()
                    : "—"}
                </td>
                <td className="border p-2">
                  {doc.file_url ? (
                    <a
                      href={`https://render-pfyp.onrender.com/download/${doc.file_url
                        .split("/")
                        .pop()}`}
                      rel="noopener noreferrer"
                    >
                      📥 Télécharger
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
