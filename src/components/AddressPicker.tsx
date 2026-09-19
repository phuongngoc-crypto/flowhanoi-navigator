import { useState } from "react";
import { Crosshair, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { ClientMap } from "./ClientMap";
import { reverseGeocode, searchHanoi, type LatLng, type SearchResult } from "@/lib/tomtom";

type Props = {
  /** Văn bản số nhà / ngõ / ngách do người dùng gõ — luôn được giữ nguyên */
  address: string;
  onAddressChange: (value: string) => void;
  point: LatLng | null;
  onPointChange: (point: LatLng) => void;
  label?: string;
  placeholder?: string;
};

export function AddressPicker({
  address,
  onAddressChange,
  point,
  onPointChange,
  label = "Địa chỉ (số nhà, ngõ, ngách, đường)",
  placeholder = "VD: Số 12, ngõ 34, ngách 5, phố Chùa Láng, Đống Đa",
}: Props) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSearch() {
    if (!address.trim()) return;
    setBusy(true);
    try {
      const found = await searchHanoi(address);
      setResults(found);
      if (found.length === 0) toast.error("Không tìm thấy toạ độ, hãy chạm trực tiếp lên bản đồ");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function useCurrentGps() {
    if (!navigator.geolocation) {
      toast.error("Thiết bị không hỗ trợ định vị");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onPointChange(p);
        if (!address.trim()) {
          const found = await reverseGeocode(p);
          if (found) onAddressChange(found);
        }
        setBusy(false);
        toast.success("Đã ghim vị trí GPS hiện tại");
      },
      () => {
        setBusy(false);
        toast.error("Không lấy được GPS, hãy cho phép quyền định vị");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>
      <textarea
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="text-xs text-muted-foreground">
        Số nhà bạn gõ được giữ nguyên vẹn — bản đồ chỉ dùng để ghim toạ độ GPS.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Tìm toạ độ
        </button>
        <button
          type="button"
          onClick={useCurrentGps}
          className="inline-flex items-center gap-2 rounded-2xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          <Crosshair className="size-4" /> Lấy GPS hiện tại
        </button>
      </div>

      {results.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  onPointChange({ lat: r.lat, lng: r.lng });
                  setResults([]);
                  toast.success("Đã ghim toạ độ gần địa chỉ của bạn");
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-secondary"
              >
                <span className="font-medium">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="overflow-hidden rounded-2xl">
        <ClientMap from={point} onPick={onPointChange} height={260} />
      </div>
      <p className="text-xs text-muted-foreground">
        {point
          ? `Đã ghim: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)} — chạm lên bản đồ để chỉnh đúng nóc nhà.`
          : "Chạm trực tiếp lên bản đồ để ghim đúng nóc nhà bạn."}
      </p>
    </div>
  );
}
