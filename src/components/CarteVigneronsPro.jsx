import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // Ajout de Popup ici
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../style/css/CartePro.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CarteVigneronsPro() {
  const [domaines, setDomaines] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [selectedDomaine, setSelectedDomaine] = useState(null);

  const [filters, setFilters] = useState({
    appellation: "",
    commune: "",
    type_vigne: "",
    variete: "",
    nature_vin: "",
  });

  useEffect(() => {
    const fetchDomaines = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/domaines", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_SECRET}`,
          },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const data = await res.json();
        setDomaines(data);
        setFilteredDomaines(data);
      } catch (err) {
        console.error("❌ Erreur fetch domaines :", err);
      }
    };

    fetchDomaines();
  }, []);

  useEffect(() => {
    let filtered = [...domaines];

    if (filters.appellation) {
      filtered = filtered.filter((d) =>
        d.appellation?.toLowerCase().includes(filters.appellation.toLowerCase())
      );
    }
    if (filters.commune) {
      filtered = filtered.filter((d) =>
        d.commune?.toLowerCase().includes(filters.commune.toLowerCase())
      );
    }
    if (filters.type_vigne) {
      filtered = filtered.filter((d) =>
        d.type_vigne?.toLowerCase().includes(filters.type_vigne.toLowerCase())
      );
    }
    if (filters.variete) {
      filtered = filtered.filter((d) =>
        d.variete?.toLowerCase().includes(filters.variete.toLowerCase())
      );
    }
    if (filters.nature_vin) {
      filtered = filtered.filter((d) =>
        d.nature_vin?.toLowerCase().includes(filters.nature_vin.toLowerCase())
      );
    }

    setFilteredDomaines(filtered);
  }, [filters, domaines]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="flex-carte-pro"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Filtres */}
      <div
        className="filtres-container-pro"
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div className="select-wrapper">
          <select name="appellation" onChange={handleFilterChange}>
            <option value="">Sélectionner une Appellation</option>
            {[
              ...new Set(domaines.map((d) => d.appellation).filter(Boolean)),
            ].map((app, idx) => (
              <option key={idx} value={app}>
                {app}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <select name="commune" onChange={handleFilterChange}>
            <option value="">Sélectionner une Commune</option>
            {[...new Set(domaines.map((d) => d.commune).filter(Boolean))].map(
              (commune, idx) => (
                <option key={idx} value={commune}>
                  {commune}
                </option>
              )
            )}
          </select>
        </div>
        <div className="select-wrapper">
          <select name="type_vigne" onChange={handleFilterChange}>
            <option value="">Sélectionner un Type de vigne</option>
            {[
              ...new Set(domaines.map((d) => d.type_vigne).filter(Boolean)),
            ].map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <select name="variete" onChange={handleFilterChange}>
            <option value="">Sélectionner une Variété</option>
            {[...new Set(domaines.map((d) => d.variete).filter(Boolean))].map(
              (variete, idx) => (
                <option key={idx} value={variete}>
                  {variete}
                </option>
              )
            )}
          </select>
        </div>
        <div className="select-wrapper">
          <select name="nature_vin" onChange={handleFilterChange}>
            <option value="">Sélectionner la Nature du vin</option>
            {[
              ...new Set(domaines.map((d) => d.nature_vin).filter(Boolean)),
            ].map((nature, idx) => (
              <option key={idx} value={nature}>
                {nature}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Carte */}
      <MapContainer
        center={[45.9, 4.5]}
        className="map-edit-pro"
        zoom={10}
        style={{
          height: "80vh",
          width: selectedDomaine ? "calc(100% - 400px)" : "100%",
          transition: "width 0.3s ease",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
        />

        {filteredDomaines.map((d, idx) => {
          const lat = parseFloat(d.lat);
          const lon = parseFloat(d.lon);
          if (isNaN(lat) || isNaN(lon)) return null;

          return (
            <Marker
              key={idx}
              position={[lat, lon]}
              eventHandlers={{
                click: () => setSelectedDomaine(d),
              }}
            >
              <Popup>
                <strong>{d.nom}</strong>
                <br />
                {d.adresse && (
                  <>
                    📍 {d.adresse}
                    <br />
                  </>
                )}
                {d.ville && (
                  <>
                    🏘️ {d.ville}
                    <br />
                  </>
                )}
                {d.appellation && (
                  <>
                    🍇 Appellation : {d.appellation}
                    <br />
                  </>
                )}
                {d.type_vigne && (
                  <>
                    🌱 Type de vigne : {d.type_vigne}
                    <br />
                  </>
                )}
                {d.variete && (
                  <>
                    🍷 Variété : {d.variete}
                    <br />
                  </>
                )}
                {d.nature_vin && (
                  <>
                    🍾 Nature du vin : {d.nature_vin}
                    <br />
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {selectedDomaine && (
        <>
          {/* Overlay en arrière-plan */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
            onClick={() => setSelectedDomaine(null)}
          />

          {/* Panneau latéral au-dessus de tout */}
          <div
            className="side-panel"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "350px",
              height: "100vh",
              backgroundColor: "#fff",
              zIndex: 9999,
              boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
              padding: "30px 20px",
              overflowY: "auto",
            }}
          >
            <button
              className="close-btn"
              onClick={() => setSelectedDomaine(null)}
            >
              ✖
            </button>

            <h2>{selectedDomaine.nom}</h2>
            {selectedDomaine.adresse && (
              <p>
                <strong>Adresse :</strong> {selectedDomaine.adresse}
              </p>
            )}
            {selectedDomaine.ville && (
              <p>
                <strong>Ville :</strong> {selectedDomaine.ville}
              </p>
            )}
            {selectedDomaine.certification && (
              <p>
                <strong>Certification :</strong> {selectedDomaine.certification}
              </p>
            )}
            {selectedDomaine.description && (
              <p>
                <strong>Description :</strong> {selectedDomaine.description}
              </p>
            )}
            {selectedDomaine.telephone && (
              <p>
                <strong>Téléphone :</strong> {selectedDomaine.telephone}
              </p>
            )}
            {selectedDomaine.email && (
              <p>
                <strong>Email :</strong>{" "}
                <a href={`mailto:${selectedDomaine.email}`}>
                  {selectedDomaine.email}
                </a>
              </p>
            )}
            <p>
              <strong>Coordonnées :</strong> {selectedDomaine.lat},{" "}
              {selectedDomaine.lon}
            </p>
            {selectedDomaine.appellation && (
              <p>
                <strong>Appellation :</strong> {selectedDomaine.appellation}
              </p>
            )}
            {selectedDomaine.type_vigne && (
              <p>
                <strong>Type de vigne :</strong> {selectedDomaine.type_vigne}
              </p>
            )}
            {selectedDomaine.variete && (
              <p>
                <strong>Variété :</strong> {selectedDomaine.variete}
              </p>
            )}
            {selectedDomaine.nature_vin && (
              <p>
                <strong>Nature du vin :</strong> {selectedDomaine.nature_vin}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
