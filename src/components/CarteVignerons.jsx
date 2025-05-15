import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../style/scss/CarteVignerons.scss";

// Fix des icônes Leaflet (essentiel pour Vite, React, etc.)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CarteVignerons() {
  const [domaines, setDomaines] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [filters, setFilters] = useState({
    appellation: "",
    commune: "",
    typeDeVigne: "",
    variete: "",
    natureVin: "",
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

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }

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

    // Appliquer les filtres
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
    if (filters.typeDeVigne) {
      filtered = filtered.filter((d) =>
        d.type_vigne?.toLowerCase().includes(filters.typeDeVigne.toLowerCase())
      );
    }
    if (filters.variete) {
      filtered = filtered.filter((d) =>
        d.variete?.toLowerCase().includes(filters.variete.toLowerCase())
      );
    }
    if (filters.natureVin) {
      filtered = filtered.filter((d) =>
        d.nature_vin?.toLowerCase().includes(filters.natureVin.toLowerCase())
      );
    }

    setFilteredDomaines(filtered); // Mettre à jour les domaines filtrés
  }, [filters, domaines]);

  // Mise à jour des filtres
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex-carte">
      <div>
        {/* Filtres */}
        <div className="filtres-container">
          <div className="select-wrapper">
            <select name="appellation" onChange={handleFilterChange}>
              <option value="">Sélectionner une appellation</option>
              {domaines
                .map((d) => d.appellation)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((appellation, idx) => (
                  <option key={idx} value={appellation}>
                    {appellation}
                  </option>
                ))}
            </select>
          </div>

          <div className="select-wrapper">
            <select name="commune" onChange={handleFilterChange}>
              <option value="">Sélectionner une commune</option>
              {domaines
                .map((d) => d.commune)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((commune, idx) => (
                  <option key={idx} value={commune}>
                    {commune}
                  </option>
                ))}
            </select>
          </div>

          <div className="select-wrapper">
            <select name="typeDeVigne" onChange={handleFilterChange}>
              <option value="">Sélectionner un type de vigne</option>
              {domaines
                .map((d) => d.type_vigne)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>

          <div className="select-wrapper">
            <select name="variete" onChange={handleFilterChange}>
              <option value="">Sélectionner une variété</option>
              {domaines
                .map((d) => d.variete)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((variete, idx) => (
                  <option key={idx} value={variete}>
                    {variete}
                  </option>
                ))}
            </select>
          </div>

          <div className="select-wrapper">
            <select name="natureVin" onChange={handleFilterChange}>
              <option value="">Sélectionner la nature du vin</option>
              {domaines
                .map((d) => d.nature_vin)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((nature, idx) => (
                  <option key={idx} value={nature}>
                    {nature}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Carte */}
      <MapContainer
        center={[45.9, 4.5]} // Beaujolais
        zoom={10}
        style={{ height: "600px", width: "100%" }}
        className="map-edit"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org">OpenStreetMap</a>'
        />

        {filteredDomaines.map((d, idx) => {
          const lat = parseFloat(d.lat);
          const lon = parseFloat(d.lon);
          if (isNaN(lat) || isNaN(lon)) return null;

          return (
            <Marker key={idx} position={[lat, lon]}>
              <Popup>
                <strong>{d.nom}</strong>
                <br />
                {d.ville || d.adresse || "📍 Lieu non précisé"}
                <br />
                {d.description || "—"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
