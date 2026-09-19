import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HANOI_CENTER, TOMTOM_KEY, type LatLng } from "@/lib/tomtom";

type Props = {
  from?: LatLng | null;
  to?: LatLng | null;
  points?: LatLng[];
  jamSegments?: LatLng[][];
  onPick?: (point: LatLng) => void;
  height?: number;
};

function pinIcon(letter: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:${color};color:#fff;font-weight:700;font-family:inherit;box-shadow:0 4px 12px rgba(0,0,0,.3);border:2px solid #fff">${letter}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function TrafficMap({
  from,
  to,
  points,
  jamSegments,
  onPick,
  height = 320,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [HANOI_CENTER.lat, HANOI_CENTER.lng],
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer(
      `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
      { maxZoom: 20, attribution: "&copy; TomTom" },
    ).addTo(map);
    L.tileLayer(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
      { maxZoom: 20, opacity: 0.85 },
    ).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      pickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (points && points.length > 1) {
      L.polyline(
        points.map((p) => [p.lat, p.lng] as [number, number]),
        { color: "#10B981", weight: 6, opacity: 0.9 },
      ).addTo(layer);
    }
    (jamSegments ?? []).forEach((seg) => {
      L.polyline(
        seg.map((p) => [p.lat, p.lng] as [number, number]),
        { color: "#E11D48", weight: 7, opacity: 0.95 },
      ).addTo(layer);
    });
    if (from) {
      L.marker([from.lat, from.lng], { icon: pinIcon("A", "#0F766E") })
        .addTo(layer)
        .bindPopup("A · Nhà bạn");
    }
    if (to) {
      L.marker([to.lat, to.lng], { icon: pinIcon("B", "#E11D48") })
        .addTo(layer)
        .bindPopup("B · Điểm hẹn");
    }

    const bounds: [number, number][] = [];
    if (points?.length) points.forEach((p) => bounds.push([p.lat, p.lng]));
    if (from) bounds.push([from.lat, from.lng]);
    if (to) bounds.push([to.lat, to.lng]);
    if (bounds.length === 1) map.setView(bounds[0], 16);
    else if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds).pad(0.2));
  }, [from, to, points, jamSegments]);

  return <div ref={containerRef} style={{ height }} className="w-full rounded-2xl" />;
}
