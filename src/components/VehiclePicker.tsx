import { VEHICLES, type VehicleKey } from "@/lib/tomtom";

export function VehiclePicker({
  value,
  onChange,
}: {
  value: VehicleKey;
  onChange: (v: VehicleKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(Object.keys(VEHICLES) as VehicleKey[]).map((key) => {
        const v = VEHICLES[key];
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-2xl border px-3 py-3 text-left transition-all ${
              active
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            <span className="text-xl">{v.emoji}</span>
            <span className="mt-1 block text-sm font-semibold">{v.label}</span>
            <span
              className={`block text-[11px] ${active ? "opacity-85" : "text-muted-foreground"}`}
            >
              {v.note}
            </span>
          </button>
        );
      })}
    </div>
  );
}
