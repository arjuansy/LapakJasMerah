import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Trash2, X, Check } from "lucide-react";
import type { CodSpot } from "../../types/cod";

// Icon sama seperti CodLocationMap, supaya konsisten visual antara
// tampilan admin/seller (picker) dan tampilan pembeli (CodLocationMap)
const pinIcon = L.divIcon({
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z" fill="#c41230"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <path d="M16 11.5l2 4 4.4.6-3.2 3 .8 4.3L16 21.3l-3.9 2.1.8-4.3-3.2-3 4.4-.6z" fill="#c41230"/>
    </svg>
  `,
  className: "cod-marker-icon",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

// Icon sementara untuk pin yang baru diklik, belum disimpan (warna beda biar jelas beda status)
const draftPinIcon = L.divIcon({
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z" fill="#3B82F6"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `,
  className: "cod-marker-icon-draft",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

const TAG_OPTIONS = [
  "Area CCTV & Satpam",
  "Ramai & Terang",
  "Dekat Parkiran",
  "Dalam Kampus",
  "Dekat Gerbang",
];

interface DraftPin {
  lat: number;
  lng: number;
}

// Komponen kecil untuk menangkap event klik di peta — react-leaflet
// mengharuskan ini via hook useMapEvents di dalam child component dari MapContainer
function MapClickCatcher({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface CodLocationPickerProps {
  /** Daftar titik COD yang sudah tersimpan — dikontrol dari form induk (AddProduct/EditProduct) */
  value: CodSpot[];
  /** Dipanggil setiap kali list berubah (tambah/hapus) — form induk tinggal setState dari sini */
  onChange: (spots: CodSpot[]) => void;
  initialCenter?: [number, number];
  height?: number;
}

export default function CodLocationPicker({
  value,
  onChange,
  initialCenter = [-7.9215, 112.5975], // pusat kampus UMM, sesuaikan kalau perlu
  height = 280,
}: CodLocationPickerProps) {
  const [draftPin, setDraftPin] = useState<DraftPin | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<string>("");

  function handleMapClick(lat: number, lng: number) {
    setDraftPin({ lat, lng });
    setFormOpen(true);
    setName("");
    setDescription("");
    setTag("");
  }

  function handleSaveSpot() {
    if (!draftPin || !name.trim()) return;

    const newSpot: CodSpot = {
      id: crypto.randomUUID(), // unik per sesi input
      name: name.trim(),
      description: description.trim(),
      lat: draftPin.lat,
      lng: draftPin.lng,
      tag: tag || undefined,
    };

    onChange([...value, newSpot]);
    setFormOpen(false);
    setDraftPin(null);
  }

  function handleCancelDraft() {
    setFormOpen(false);
    setDraftPin(null);
  }

  function handleRemoveSpot(id: string) {
    onChange(value.filter((s) => s.id !== id));
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-foreground font-bold text-sm">Lokasi COD untuk Produk Ini</h4>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
          {value.length} titik
        </span>
      </div>
      <p className="text-muted-foreground text-xs mb-3">
        Ketuk di peta untuk menambah titik lokasi COD aman. Kosongkan jika ingin pakai lokasi default.
      </p>

      <div
        className="relative w-full rounded-xl overflow-hidden border border-border shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={initialCenter}
          zoom={16}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickCatcher onMapClick={handleMapClick} />

          {/* Pin yang sudah tersimpan */}
          {value.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={pinIcon} />
          ))}

          {/* Pin draft (baru diklik, belum disimpan) */}
          {draftPin && (
            <Marker position={[draftPin.lat, draftPin.lng]} icon={draftPinIcon} />
          )}
        </MapContainer>

        <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow border border-white/50 z-[400]">
          <p className="text-[10px] font-semibold text-foreground text-center">
            Ketuk peta untuk menambah titik COD baru
          </p>
        </div>
      </div>

      {/* List pin tersimpan, dengan tombol hapus */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((spot) => (
            <div
              key={spot.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-xs truncate">{spot.name}</p>
                {spot.description && (
                  <p className="text-muted-foreground text-[10px] line-clamp-1">{spot.description}</p>
                )}
              </div>
              {spot.tag && (
                <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                  {spot.tag}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveSpot(spot.id)}
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 hover:bg-red-100 transition-colors"
                aria-label={`Hapus ${spot.name}`}
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom sheet: isi detail pin baru */}
      {formOpen && draftPin && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end items-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancelDraft} />
          <div className="relative bg-card rounded-t-3xl shadow-2xl p-5 pb-7 w-full max-w-[430px] z-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-foreground font-black text-base">Detail Lokasi COD</h4>
              <button
                type="button"
                onClick={handleCancelDraft}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                <X size={15} className="text-foreground" />
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground mb-3">
              Koordinat: {draftPin.lat.toFixed(5)}, {draftPin.lng.toFixed(5)}
            </p>

            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Nama Lokasi <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Gedung Kuliah Bersama I"
              maxLength={80}
              className="w-full text-sm text-foreground bg-secondary border-2 border-border rounded-2xl px-4 py-3 mb-4 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              autoFocus
            />

            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Deskripsi Singkat (opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="contoh: Lobi utama, dekat pos satpam"
              maxLength={120}
              className="w-full text-sm text-foreground bg-secondary border-2 border-border rounded-2xl px-4 py-3 mb-4 outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-muted-foreground"
            />

            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">
              Tag (opsional)
            </label>
            <div className="flex flex-wrap gap-2 mb-5">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(tag === t ? "" : t)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all"
                  style={{
                    borderColor: tag === t ? "#c41230" : "rgba(0,0,0,0.1)",
                    background: tag === t ? "rgba(196,18,48,0.08)" : "transparent",
                    color: tag === t ? "#c41230" : "#6b7280",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveSpot}
              disabled={!name.trim()}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check size={18} />
              Simpan Titik Lokasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
