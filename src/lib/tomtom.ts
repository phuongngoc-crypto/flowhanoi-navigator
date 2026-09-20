// Cấu hình dịch vụ bản đồ & giao thông thời gian thực (nhúng sẵn, không hiển thị ra giao diện)
export const TOMTOM_KEY = "gvmI8Uel6GuwZw2ot0aEiPPGYwEWxX1k";

export const HANOI_CENTER = { lat: 21.0278, lng: 105.8342 };

export type LatLng = { lat: number; lng: number };

export type VehicleKey = "motorbike" | "car" | "bus" | "walk";

export const VEHICLES: Record<
  VehicleKey,
  { label: string; emoji: string; buffer: number; travelMode: string; note: string }
> = {
  motorbike: {
    label: "Xe máy",
    emoji: "🛵",
    buffer: 5,
    travelMode: "motorcycle",
    note: "Đệm gửi xe 5 phút",
  },
  car: {
    label: "Ô tô / Taxi",
    emoji: "🚗",
    buffer: 15,
    travelMode: "car",
    note: "Đệm tìm bãi đỗ 15 phút",
  },
  bus: {
    label: "Bus / Tàu điện",
    emoji: "🚇",
    buffer: 10,
    travelMode: "bus",
    note: "Đệm đi bộ & chờ tàu 10 phút",
  },
  walk: {
    label: "Đi bộ",
    emoji: "🚶",
    buffer: 0,
    travelMode: "pedestrian",
    note: "Không cần đệm",
  },
};

export type SearchResult = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export async function searchHanoi(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  // Fuzzy Search API: bắt được cả số nhà, ngõ, ngách, phố viết tắt/sai chính tả
  const withCity = /hà\s*nội|ha\s*noi/i.test(q) ? q : `${q}, Hà Nội`;
  const url =
    `https://api.tomtom.com/search/2/search/${encodeURIComponent(withCity)}.json` +
    `?key=${TOMTOM_KEY}&limit=8&countrySet=VN&lat=${HANOI_CENTER.lat}&lon=${HANOI_CENTER.lng}` +
    `&radius=45000&language=vi-VN&typeahead=true&minFuzzyLevel=1&maxFuzzyLevel=4` +
    `&idxSet=PAD,Addr,Str,POI,Geo&extendedPostalCodesFor=PAD,Addr&view=Unified`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tìm được địa chỉ, thử lại nhé");
  const json = (await res.json()) as {
    results?: Array<{
      id: string;
      poi?: { name?: string };
      address?: { freeformAddress?: string };
      position: { lat: number; lon: number };
    }>;
  };
  return (json.results ?? []).map((r) => ({
    id: r.id,
    label: r.poi?.name ?? r.address?.freeformAddress ?? "Địa điểm",
    address: r.address?.freeformAddress ?? "",
    lat: r.position.lat,
    lng: r.position.lon,
  }));
}

export async function reverseGeocode(point: LatLng): Promise<string> {
  const url = `https://api.tomtom.com/search/2/reverseGeocode/${point.lat},${point.lng}.json?key=${TOMTOM_KEY}&language=vi-VN`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const json = (await res.json()) as {
    addresses?: Array<{ address?: { freeformAddress?: string } }>;
  };
  return json.addresses?.[0]?.address?.freeformAddress ?? "";
}

export type RouteResult = {
  distanceKm: number;
  travelMinutes: number;
  delayMinutes: number;
  points: LatLng[];
  jamSegments: LatLng[][];
};

export async function calculateRoute(
  from: LatLng,
  to: LatLng,
  vehicle: VehicleKey,
): Promise<RouteResult> {
  const mode = VEHICLES[vehicle].travelMode;
  const url =
    `https://api.tomtom.com/routing/1/calculateRoute/${from.lat},${from.lng}:${to.lat},${to.lng}/json` +
    `?key=${TOMTOM_KEY}&traffic=true&travelMode=${mode}&sectionType=traffic` +
    `&computeTravelTimeFor=all&routeType=fastest`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tính được lộ trình lúc này");
  const json = (await res.json()) as {
    routes?: Array<{
      summary: {
        lengthInMeters: number;
        travelTimeInSeconds: number;
        trafficDelayInSeconds?: number;
      };
      legs: Array<{ points: Array<{ latitude: number; longitude: number }> }>;
      sections?: Array<{
        sectionType?: string;
        startPointIndex: number;
        endPointIndex: number;
        magnitudeOfDelay?: number;
      }>;
    }>;
  };
  const route = json.routes?.[0];
  if (!route) throw new Error("Không tìm thấy tuyến đường phù hợp");

  const points: LatLng[] = route.legs.flatMap((leg) =>
    leg.points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
  );

  const jamSegments = (route.sections ?? [])
    .filter((s) => (s.sectionType ?? "TRAFFIC") === "TRAFFIC" && (s.magnitudeOfDelay ?? 1) >= 1)
    .map((s) => points.slice(s.startPointIndex, s.endPointIndex + 1))
    .filter((seg) => seg.length > 1);

  return {
    distanceKm: route.summary.lengthInMeters / 1000,
    travelMinutes: Math.round(route.summary.travelTimeInSeconds / 60),
    delayMinutes: Math.round((route.summary.trafficDelayInSeconds ?? 0) / 60),
    points,
    jamSegments,
  };
}
