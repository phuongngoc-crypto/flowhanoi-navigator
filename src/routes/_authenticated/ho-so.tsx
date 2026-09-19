import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddressPicker } from "@/components/AddressPicker";
import { VehiclePicker } from "@/components/VehiclePicker";
import type { LatLng, VehicleKey } from "@/lib/tomtom";

export const Route = createFileRoute("/_authenticated/ho-so")({
  head: () => ({
    meta: [
      { title: "Hồ sơ cá nhân — GoFlow Hà Nội" },
      {
        name: "description",
        content:
          "Cập nhật tên, số nhà tại Hà Nội, phương tiện ưa thích và thời gian đệm cá nhân của bạn.",
      },
      { property: "og:title", content: "Hồ sơ cá nhân — GoFlow Hà Nội" },
      {
        property: "og:description",
        content: "Cá nhân hoá lộ trình GoFlow theo nơi ở và thói quen di chuyển của bạn.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [point, setPoint] = useState<LatLng | null>(null);
  const [vehicle, setVehicle] = useState<VehicleKey>("motorbike");
  const [buffer, setBuffer] = useState(10);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setAddress(profile.home_address ?? "");
    setVehicle(profile.vehicle ?? "motorbike");
    setBuffer(profile.buffer_minutes ?? 10);
    if (profile.home_lat && profile.home_lng)
      setPoint({ lat: profile.home_lat, lng: profile.home_lng });
  }, [profile]);

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || "Người dùng GoFlow",
        home_address: address,
        home_lat: point?.lat ?? null,
        home_lng: point?.lng ?? null,
        vehicle,
        buffer_minutes: buffer,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Đã lưu hồ sơ của bạn");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
      <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>

      <section className="surface space-y-3 p-4">
        <label className="block text-sm font-medium">Tên hiển thị</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Tài khoản: {user?.email}</p>
      </section>

      <section className="surface p-4">
        <AddressPicker
          label="Nơi ở hiện tại (số nhà tại Hà Nội)"
          address={address}
          onAddressChange={setAddress}
          point={point}
          onPointChange={setPoint}
        />
      </section>

      <section className="surface space-y-3 p-4">
        <h2 className="text-sm font-semibold">Phương tiện ưa thích</h2>
        <VehiclePicker value={vehicle} onChange={setVehicle} />
        <label className="block pt-2 text-sm font-medium">
          Thời gian đệm cá nhân: {buffer} phút
        </label>
        <input
          type="range"
          min={0}
          max={45}
          step={5}
          value={buffer}
          onChange={(e) => setBuffer(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
        <p className="text-xs text-muted-foreground">
          Đệm cá nhân được cộng thêm vào đệm mặc định của từng phương tiện.
        </p>
      </section>

      <button
        onClick={save}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Lưu hồ sơ
      </button>
    </main>
  );
}
