import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { ClientMap } from "@/components/ClientMap";
import { calculateRoute, VEHICLES } from "@/lib/tomtom";
import { DAY_LABELS, hhmm, todayItems, type ScheduleItem } from "@/lib/schedule";

export const Route = createFileRoute("/_authenticated/chuyen-di")({
  head: () => ({
    meta: [
      { title: "Kế hoạch di chuyển — GoFlow Hà Nội" },
      {
        name: "description",
        content:
          "Danh sách chuyến đi trong ngày, chi tiết lộ trình kèm đoạn kẹt xe và đánh giá 1-5 sao sau mỗi chuyến.",
      },
      { property: "og:title", content: "Kế hoạch di chuyển — GoFlow Hà Nội" },
      {
        property: "og:description",
        content: "Theo dõi từng chuyến đi trong ngày và chấm điểm trải nghiệm di chuyển.",
      },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { user, profile } = useAuth();
  const { data: items = [] } = useScheduleItems(user?.id);
  const [selected, setSelected] = useState<ScheduleItem | null>(null);
  const now = useMemo(() => new Date(), []);
  const trips = todayItems(items, now);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
      <h1 className="text-2xl font-bold">Kế hoạch di chuyển</h1>
      <p className="text-sm text-muted-foreground">
        {DAY_LABELS[now.getDay()]} · {trips.length} chuyến đi
      </p>

      {trips.length === 0 && (
        <div className="surface p-6 text-sm text-muted-foreground">
          Hôm nay bạn chưa có chuyến đi nào.
        </div>
      )}

      <div className="space-y-2">
        {trips.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(selected?.id === t.id ? null : t)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
              selected?.id === t.id ? "border-primary bg-secondary" : "border-border bg-card"
            }`}
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="font-bold text-primary">{hhmm(t.start_time)}</span>
              <span className="truncate font-medium">{t.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {t.room ?? t.place_name ?? ""}
              </span>
            </span>
          </button>
        ))}
      </div>

      {selected && <TripDetail item={selected} homeLat={profile?.home_lat} homeLng={profile?.home_lng} />}
    </main>
  );
}

function TripDetail({
  item,
  homeLat,
  homeLng,
}: {
  item: ScheduleItem;
  homeLat?: number | null | undefined;
  homeLng?: number | null | undefined;
}) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const vehicle = profile?.vehicle ?? "motorbike";

  const from = homeLat && homeLng ? { lat: homeLat, lng: homeLng } : null;
  const to = item.lat && item.lng ? { lat: item.lat, lng: item.lng } : null;

  const routeQuery = useQuery({
    queryKey: ["trip-route", item.id, vehicle],
    enabled: !!from && !!to,
    queryFn: () => calculateRoute(from!, to!, vehicle),
  });

  const feedback = useQuery({
    queryKey: ["feedback", item.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("trip_feedback")
        .select("id, rating, comment, created_at")
        .eq("schedule_item_id", item.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  async function submit() {
    if (!user || rating === 0) {
      toast.error("Hãy chọn số sao trước nhé");
      return;
    }
    const { error } = await supabase.from("trip_feedback").insert({
      user_id: user.id,
      schedule_item_id: item.id,
      rating,
      comment: comment || null,
      vehicle,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setComment("");
    setRating(0);
    toast.success("Cảm ơn đánh giá của bạn!");
    void queryClient.invalidateQueries({ queryKey: ["feedback", item.id] });
  }

  return (
    <section className="surface space-y-4 p-4">
      <div>
        <h2 className="text-lg font-bold">{item.title}</h2>
        <p className="text-sm text-muted-foreground">
          {item.address ?? item.place_name ?? "Chưa có địa chỉ điểm đến"}
        </p>
      </div>

      <ClientMap
        from={from}
        to={to}
        points={routeQuery.data?.points}
        jamSegments={routeQuery.data?.jamSegments}
        height={280}
      />

      {routeQuery.data ? (
        <p className="text-sm">
          {VEHICLES[vehicle].emoji} {routeQuery.data.distanceKm.toFixed(1)} km ·{" "}
          {routeQuery.data.travelMinutes} phút ·{" "}
          <span className="text-destructive">+{routeQuery.data.delayMinutes} phút kẹt xe</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {from && to ? "Đang tính lộ trình…" : "Thiếu toạ độ nhà hoặc điểm đến."}
        </p>
      )}

      <div>
        <h3 className="text-sm font-semibold">Đánh giá chuyến đi</h3>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} sao`}>
              <Star
                className={`size-7 ${
                  n <= rating ? "fill-[var(--color-warn)] text-[var(--color-warn)]" : "text-border"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Đường hôm nay thế nào?"
          className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={submit}
          className="mt-2 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
        >
          Gửi đánh giá
        </button>
      </div>

      {(feedback.data?.length ?? 0) > 0 && (
        <ul className="space-y-2 text-sm">
          {feedback.data!.map((f) => (
            <li key={f.id} className="rounded-2xl bg-secondary px-4 py-2">
              <span className="font-semibold text-primary">{"★".repeat(f.rating)}</span>{" "}
              {f.comment ?? ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
