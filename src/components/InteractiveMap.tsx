"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const destinationMarkers = [
  { name: "Lac Assal", slug: "lac-assal", lat: 11.657, lng: 42.416, color: "#408398", emoji: "🧂" },
  { name: "Lac Abbé", slug: "lac-abbe", lat: 11.117, lng: 41.783, color: "#e8645a", emoji: "🌋" },
  { name: "Sables Blancs", slug: "sables-blancs", lat: 11.790, lng: 42.870, color: "#25D366", emoji: "🏖️" },
  { name: "Requin-Baleine", slug: "requin-baleine", lat: 11.517, lng: 42.944, color: "#7c3aed", emoji: "🦈" },
  { name: "Loubatanleh", slug: "loubatanleh", lat: 11.513, lng: 42.908, color: "#f59e0b", emoji: "🌿" },
  { name: "Goubet", slug: "goubet", lat: 11.517, lng: 42.783, color: "#1d4ed8", emoji: "🌊" },
  { name: "Bankoualeh", slug: "bankoualeh", lat: 11.783, lng: 42.750, color: "#dc2626", emoji: "🏕️" },
  { name: "Ditilou", slug: "ditilou", lat: 11.700, lng: 42.617, color: "#059669", emoji: "🦅" },
  { name: "Dépression des Allos", slug: "depression-allos", lat: 11.133, lng: 42.717, color: "#d97706", emoji: "⛏️" },
  { name: "Obock & Mangroves", slug: "obock-godoria", lat: 11.967, lng: 43.300, color: "#0891b2", emoji: "🌴" },
  { name: "Forêt du Day", slug: "foret-day", lat: 11.800, lng: 42.700, color: "#16a34a", emoji: "🌲" },
  { name: "Abourma", slug: "abourma", lat: 12.350, lng: 42.150, color: "#9333ea", emoji: "🪨" },
  { name: "Îles Moucha & Maskali", slug: "iles-moucha-maskali", lat: 11.617, lng: 43.200, color: "#0284c7", emoji: "🏝️" },
];

export default function InteractiveMap() {
  const { t } = useLanguage();
  const discoverLink = t("map.discoverLink");

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const mapContainer = document.getElementById("djibouti-map");
      if (!mapContainer || (mapContainer as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      const map = L.map("djibouti-map", {
        center: [11.825, 42.59],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      destinationMarkers.forEach((dest) => {
        const icon = L.divIcon({
          html: `<div style="
            background: ${dest.color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            width: 36px; height: 36px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
          "><span style="transform: rotate(45deg); display:block;">${dest.emoji}</span></div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -40],
        });

        const marker = L.marker([dest.lat, dest.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="text-align:center; padding: 8px; min-width: 160px;">
            <div style="font-size:24px; margin-bottom:6px;">${dest.emoji}</div>
            <div style="font-weight:700; color:#1a1a1a; font-size:14px; margin-bottom:8px;">${dest.name}</div>
            <a href="/destinations/${dest.slug}" style="
              display:inline-block; background:${dest.color}; color:white;
              padding: 6px 16px; border-radius: 999px; font-size: 12px;
              font-weight: 600; text-decoration: none;">
              ${discoverLink}
            </a>
          </div>
        `);
      });

      // Recenter button
      const btn = document.getElementById("recenter-btn");
      if (btn) {
        btn.addEventListener("click", () => {
          map.setView([11.825, 42.59], 8);
        });
      }
    };

    initMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div id="djibouti-map" className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ height: "520px" }} />
      <button
        id="recenter-btn"
        className="absolute top-4 right-4 z-[1000] bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-gray-50 flex items-center gap-2 transition-all hover:-translate-y-0.5"
      >
        {t("map.recenter")}
      </button>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {destinationMarkers.map((d) => (
          <Link
            key={d.slug}
            href={`/destinations/${d.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
            style={{ background: d.color }}
          >
            <span>{d.emoji}</span>
            <span>{d.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
