import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Shield, Navigation, X } from "lucide-react";
import type { CodSpot } from "../../types/cod";

// Fix default marker icon (Leaflet's default icons break with bundlers like Vite/Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom maroon pin icon untuk titik COD aman (LapakJasMerah brand color)
const safeIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z" fill="#c41230"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <path d="M16 11l2.5 5h5.5l-4.5 3.5 1.7 5.5L16 21.5l-5.2 3.5 1.7-5.5L8 16h5.5z" fill="#c41230" transform="scale(0.55) translate(13,12)"/>
      </svg>
    `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

// Titik-titik COD aman di sekitar kampus UMM (Universitas Muhammadiyah Malang)
// Ganti / sesuaikan koordinat ini dengan lokasi nyata yang sudah divalidasi tim kamu
export const DEFAULT_COD_SPOTS: CodSpot[] = [
  {
    id: "umm-gkb1",
    name: "Gedung Kuliah Bersama I (GKB I)",
    description: "Lobi utama, dekat pos satpam dan ramai mahasiswa.",
    lat: -7.9215,
    lng: 112.5975,
    tag: "Area CCTV & Satpam",
  },
  {
    id: "umm-masjid",
    name: "Masjid AR. Fachruddin UMM",
    description: "Plaza depan masjid, area terbuka dan terang.",
    lat: -7.9203,
    lng: 112.5968,
    tag: "Ramai & Terang",
  },
  {
    id: "umm-sengkaling",
    name: "Pintu Masuk UMM Dome",
    description: "Dekat parkiran motor, akses mudah dari gerbang utama.",
    lat: -7.9229,
    lng: 112.5981,
    tag: "Dekat Parkiran",
  },
];

function FlyToSpot({ spot }: { spot: CodSpot | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (spot) {
      map.flyTo([spot.lat, spot.lng], 17, { duration: 0.8 });
    }
  }, [spot, map]);
  return null;
}

interface CodLocationMapProps {
  spots?: CodSpot[];
  initialCenter?: [number, number];
  height?: number;
}

export default function CodLocationMap({
  spots = DEFAULT_COD_SPOTS,
  initialCenter = [-7.9215, 112.5975], // pusat kampus UMM
  height = 280,
}: CodLocationMapProps) {
  const [selected, setSelected] = useState<CodSpot | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleSelect(spot: CodSpot) {
    setSelected(spot);
    setSheetOpen(true);
  }

  function openDirections(spot: CodSpot) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(url, "_blank");
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-sm">Rekomendasi Lokasi COD</h3>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
          Aman & Ramai
        </span>
      </div>

      <div
        className="relative w-full rounded-xl overflow-hidden border border-border shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={initialCenter}
          zoom={16}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={safeIcon}
              eventHandlers={{ click: () => handleSelect(spot) }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold mb-0.5">{spot.name}</p>
                  <p className="text-muted-foreground">{spot.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <FlyToSpot spot={selected} />
        </MapContainer>

        {/* Badge keamanan, overlay di pojok kiri bawah peta */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow border border-white/50 z-[400]">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-foreground leading-tight truncate">
              {spots.length} titik COD aman tersedia
            </p>
            <p className="text-[9px] text-muted-foreground line-clamp-1">
              Ketuk pin untuk lihat detail & rute
            </p>
          </div>
        </div>
      </div>

      {/* List titik COD di bawah peta — supaya tetap bisa dipilih tanpa harus tap pin */}
      <div className="mt-3 space-y-2">
        {spots.map((spot) => (
          <button
            key={spot.id}
            onClick={() => handleSelect(spot)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border text-left hover:bg-muted/50 active:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-semibold text-xs truncate">{spot.name}</p>
              <p className="text-muted-foreground text-[10px] line-clamp-1">{spot.description}</p>
            </div>
            {spot.tag && (
              <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                {spot.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom sheet detail lokasi terpilih */}
      {sheetOpen && selected && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end items-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative bg-card rounded-t-3xl shadow-2xl p-5 pb-7 w-full max-w-[430px] z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-foreground font-black text-base">{selected.name}</h4>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                <X size={15} className="text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">{selected.description}</p>
            <button
              onClick={() => openDirections(selected)}
              className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Lihat Rute di Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
